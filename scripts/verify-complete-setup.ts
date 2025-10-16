import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Inline prismaForOrg for testing (avoid server-only import)
function prismaForOrg(orgId: string): PrismaClient {
  const extension = Prisma.defineExtension((client) =>
    client.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await client.$transaction([
              client.$executeRaw`SELECT set_config('app.current_organization', ${orgId}::text, TRUE)`,
              query(args),
            ]);
            return result as any;
          },
        },
      },
    })
  );

  return (prisma as any).$extends(extension) as PrismaClient;
}

async function verifyCompleteSetup() {
  console.log("🔍 Verifying Complete RLS & Org Management Setup\n");
  console.log("=".repeat(60));

  try {
    // 1. Check RLS Status
    console.log("\n📊 1. RLS STATUS");
    console.log("-".repeat(60));
    
    const rlsStatus = await prisma.$queryRaw<Array<{
      tablename: string;
      rowsecurity: boolean;
    }>>`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN (
        'properties', 'clients', 'tasks', 'activities',
        'addresses', 'listings', 'media_assets',
        'interactions', 'notes', 'client_relationships'
      )
      ORDER BY tablename;
    `;

    const allEnabled = rlsStatus.every(r => r.rowsecurity);
    console.log(`${allEnabled ? '✅' : '❌'} All tenant tables have RLS enabled: ${allEnabled}`);
    console.log(`   Total tables checked: ${rlsStatus.length}/10`);
    
    if (!allEnabled) {
      rlsStatus.filter(r => !r.rowsecurity).forEach(r => {
        console.log(`   ❌ ${r.tablename}: NOT ENABLED`);
      });
    }

    // 2. Check Policy Count
    console.log("\n🔐 2. RLS POLICIES");
    console.log("-".repeat(60));
    
    const policyCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM pg_policies
      WHERE schemaname = 'public';
    `;

    const count = Number(policyCount[0].count);
    const expected = 40; // 10 tables × 4 policies each
    console.log(`${count === expected ? '✅' : '⚠️'} Policy count: ${count}/${expected}`);

    // 3. Check for duplicates
    const duplicates = await prisma.$queryRaw<Array<{
      tablename: string;
      count: bigint;
    }>>`
      SELECT tablename, COUNT(*) as count
      FROM pg_policies
      WHERE schemaname = 'public'
      GROUP BY tablename
      HAVING COUNT(*) > 4;
    `;

    if (duplicates.length === 0) {
      console.log('✅ No duplicate policies found');
    } else {
      console.log('⚠️  Tables with extra policies:');
      duplicates.forEach(d => {
        console.log(`   ${d.tablename}: ${d.count} policies (expected 4)`);
      });
    }

    // 4. Check Invitation System
    console.log("\n📬 3. INVITATION SYSTEM");
    console.log("-".repeat(60));
    
    const invitationTableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invitations'
      );
    `;

    if (invitationTableExists[0].exists) {
      console.log('✅ Invitations table exists');
      
      // Test Prisma client access
      try {
        const invCount = await prisma.invitation.count();
        console.log(`✅ Prisma client can access invitations (count: ${invCount})`);
      } catch (e) {
        console.log('❌ Prisma client cannot access invitations:', e instanceof Error ? e.message : e);
      }

      // Check indexes
      const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'invitations'
        AND schemaname = 'public'
        ORDER BY indexname;
      `;
      console.log(`✅ Indexes created: ${indexes.length}`);
      indexes.forEach(idx => console.log(`   - ${idx.indexname}`));
    } else {
      console.log('❌ Invitations table does NOT exist');
    }

    // 5. Check Organization Relationships
    console.log("\n🏢 4. ORGANIZATION RELATIONSHIPS");
    console.log("-".repeat(60));
    
    const orgCount = await prisma.organization.count();
    console.log(`Organizations: ${orgCount}`);
    
    if (orgCount > 0) {
      const orgs = await prisma.organization.findMany({
        include: {
          _count: {
            select: {
              users: true,
              properties: true,
              clients: true,
              tasks: true,
              activities: true,
              invitations: true,
            }
          }
        }
      });

      orgs.forEach(org => {
        console.log(`\n  ${org.name} (${org.id}):`);
        console.log(`    Users: ${org._count.users}`);
        console.log(`    Properties: ${org._count.properties}`);
        console.log(`    Clients: ${org._count.clients}`);
        console.log(`    Tasks: ${org._count.tasks}`);
        console.log(`    Activities: ${org._count.activities}`);
        console.log(`    Invitations: ${org._count.invitations}`);
      });
    }

    // 6. Test prismaForOrg function
    console.log("\n🔧 5. PRISMA ORG SCOPING");
    console.log("-".repeat(60));
    
    if (orgCount > 0) {
      const testOrg = await prisma.organization.findFirst();
      if (testOrg) {
        try {
          const orgPrisma = prismaForOrg(testOrg.id);
          const testCount = await orgPrisma.property.count();
          console.log(`✅ prismaForOrg() works (org: ${testOrg.name})`);
          console.log(`   Property count via org-scoped client: ${testCount}`);
        } catch (e) {
          console.log('❌ prismaForOrg() failed:', e instanceof Error ? e.message : e);
        }
      }
    } else {
      console.log('⏭️  Skipping (no organizations)');
    }

    // 7. Check BYPASSRLS (known limitation)
    console.log("\n⚠️  6. DATABASE USER PRIVILEGES");
    console.log("-".repeat(60));
    
    const userPrivs = await prisma.$queryRaw<Array<{
      rolname: string;
      rolsuper: boolean;
      rolbypassrls: boolean;
    }>>`
      SELECT rolname, rolsuper, rolbypassrls 
      FROM pg_roles 
      WHERE rolname = current_user;
    `;

    const user = userPrivs[0];
    console.log(`User: ${user.rolname}`);
    console.log(`${user.rolsuper ? '⚠️  SUPERUSER' : '✅ Not superuser'}`);
    console.log(`${user.rolbypassrls ? '⚠️  BYPASSRLS (expected on Neon)' : '✅ No BYPASSRLS'}`);
    
    if (user.rolbypassrls) {
      console.log('\n   ℹ️  Note: BYPASSRLS is a Neon platform default.');
      console.log('   Primary isolation is application-level via prismaForOrg().');
      console.log('   RLS policies are configured as defense-in-depth.');
    }

    // 8. Final Summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 SUMMARY");
    console.log("=".repeat(60));
    
    const checks = [
      { name: 'RLS Enabled', status: allEnabled },
      { name: 'Policy Count Correct', status: count === expected },
      { name: 'No Duplicate Policies', status: duplicates.length === 0 },
      { name: 'Invitation Table Exists', status: invitationTableExists[0].exists },
      { name: 'Organizations Present', status: orgCount > 0 },
    ];

    checks.forEach(check => {
      console.log(`${check.status ? '✅' : '❌'} ${check.name}`);
    });

    const allPassed = checks.every(c => c.status);
    
    console.log("\n" + "=".repeat(60));
    if (allPassed) {
      console.log("🎉 ALL CHECKS PASSED - SETUP COMPLETE!");
    } else {
      console.log("⚠️  SOME CHECKS FAILED - REVIEW REQUIRED");
    }
    console.log("=".repeat(60) + "\n");

    console.log("📚 Documentation:");
    console.log("   - docs/implementation/RLS_ORG_MANAGEMENT_COMPLETE.md");
    console.log("   - docs/implementation/MIGRATION_SUMMARY.md");
    console.log("   - docs/implementation/PHASE1_RLS_STATUS.md");

  } catch (error) {
    console.error("\n❌ VERIFICATION FAILED:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCompleteSetup();
