/**
 * RLS Testing Utilities for Development
 * 
 * This file provides helper functions to test Row-Level Security
 * implementation in a development environment.
 * 
 * Usage:
 *   import { testCrossOrgIsolation } from './scripts/test-rls-utils';
 *   await testCrossOrgIsolation();
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Test 1: Verify RLS blocks queries without session variable
 */
export async function testEmptySession() {
  console.log('🔒 Testing RLS enforcement with empty session variable...\n');
  
  try {
    // Attempt to query without setting session variable
    await prisma.$executeRawUnsafe(
      `SELECT set_config('app.current_organization', '', TRUE)`
    );
    
    const result = await prisma.property.findMany();
    
    if (result.length === 0) {
      console.log('✅ PASS: RLS blocked access without session variable');
      return true;
    } else {
      console.log(`❌ FAIL: RLS allowed access without session variable (${result.length} rows returned)`);
      return false;
    }
  } catch (error) {
    console.log('✅ PASS: Query threw error (expected with RLS)');
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return true;
  }
}

/**
 * Test 2: Verify cross-organization isolation
 */
export async function testCrossOrgIsolation() {
  console.log('🔒 Testing cross-organization data isolation...\n');
  
  try {
    // Get all organizations
    const orgs = await prisma.organization.findMany({
      take: 2,
      include: {
        properties: true,
      },
    });
    
    if (orgs.length < 2) {
      console.log('⚠️  SKIP: Need at least 2 organizations to test isolation');
      console.log('   Create test organizations first');
      return false;
    }
    
    const [orgA, orgB] = orgs;
    
    console.log(`Testing with:`);
    console.log(`  Org A: ${orgA.name} (${orgA.properties.length} properties)`);
    console.log(`  Org B: ${orgB.name} (${orgB.properties.length} properties)\n`);
    
    // Test Org A context
    await prisma.$executeRawUnsafe(
      `SELECT set_config('app.current_organization', $1, TRUE)`,
      orgA.id
    );
    
    const orgAProperties = await prisma.property.findMany();
    const orgAPropertiesCount = orgAProperties.length;
    
    console.log(`Org A context: ${orgAPropertiesCount} properties visible`);
    
    // Verify all properties belong to Org A
    const orgAMismatch = orgAProperties.filter(p => p.organizationId !== orgA.id);
    if (orgAMismatch.length > 0) {
      console.log(`❌ FAIL: Found ${orgAMismatch.length} properties from other organizations`);
      return false;
    }
    
    // Test Org B context
    await prisma.$executeRawUnsafe(
      `SELECT set_config('app.current_organization', $1, TRUE)`,
      orgB.id
    );
    
    const orgBProperties = await prisma.property.findMany();
    const orgBPropertiesCount = orgBProperties.length;
    
    console.log(`Org B context: ${orgBPropertiesCount} properties visible\n`);
    
    // Verify all properties belong to Org B
    const orgBMismatch = orgBProperties.filter(p => p.organizationId !== orgB.id);
    if (orgBMismatch.length > 0) {
      console.log(`❌ FAIL: Found ${orgBMismatch.length} properties from other organizations`);
      return false;
    }
    
    // Verify counts don't overlap (unless both orgs have same number)
    if (orgAPropertiesCount === orgA.properties.length &&
        orgBPropertiesCount === orgB.properties.length) {
      console.log('✅ PASS: Cross-organization isolation verified');
      console.log('   Each organization sees only its own data');
      return true;
    } else {
      console.log('❌ FAIL: Property counts don\'t match expected values');
      console.log(`   Expected Org A: ${orgA.properties.length}, Got: ${orgAPropertiesCount}`);
      console.log(`   Expected Org B: ${orgB.properties.length}, Got: ${orgBPropertiesCount}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Test 3: Verify dependent table policies
 */
export async function testDependentTables() {
  console.log('🔒 Testing dependent table RLS policies...\n');
  
  try {
    // Get an organization with properties
    const org = await prisma.organization.findFirst({
      include: {
        properties: {
          include: {
            address: true,
            listing: true,
            mediaAssets: true,
          },
          take: 1,
        },
      },
    });
    
    if (!org || org.properties.length === 0) {
      console.log('⚠️  SKIP: Need organization with properties to test');
      return false;
    }
    
    const property = org.properties[0];
    
    // Set context to organization
    await prisma.$executeRawUnsafe(
      `SELECT set_config('app.current_organization', $1, TRUE)`,
      org.id
    );
    
    console.log(`Testing dependent tables for property: ${property.id}\n`);
    
    // Test address access
    if (property.address) {
      const address = await prisma.address.findUnique({
        where: { id: property.address.id },
      });
      
      if (address) {
        console.log('✅ Address accessible with correct org context');
      } else {
        console.log('❌ Address not accessible (RLS may be blocking incorrectly)');
        return false;
      }
    }
    
    // Test listing access
    if (property.listing) {
      const listing = await prisma.listing.findUnique({
        where: { id: property.listing.id },
      });
      
      if (listing) {
        console.log('✅ Listing accessible with correct org context');
      } else {
        console.log('❌ Listing not accessible (RLS may be blocking incorrectly)');
        return false;
      }
    }
    
    // Test media assets access
    if (property.mediaAssets.length > 0) {
      const mediaAsset = await prisma.mediaAsset.findUnique({
        where: { id: property.mediaAssets[0].id },
      });
      
      if (mediaAsset) {
        console.log('✅ Media asset accessible with correct org context');
      } else {
        console.log('❌ Media asset not accessible (RLS may be blocking incorrectly)');
        return false;
      }
    }
    
    // Now test with wrong org context
    const otherOrg = await prisma.organization.findFirst({
      where: { id: { not: org.id } },
    });
    
    if (otherOrg) {
      console.log(`\nTesting with wrong org context (${otherOrg.name})...\n`);
      
      await prisma.$executeRawUnsafe(
        `SELECT set_config('app.current_organization', $1, TRUE)`,
        otherOrg.id
      );
      
      // These should all return null
      const address = await prisma.address.findUnique({
        where: { id: property.address?.id },
      });
      
      const listing = await prisma.listing.findUnique({
        where: { id: property.listing?.id },
      });
      
      if (address === null && listing === null) {
        console.log('✅ PASS: Dependent tables properly isolated');
        console.log('   Cannot access data from other organization');
        return true;
      } else {
        console.log('❌ FAIL: Dependent tables accessible from wrong org');
        return false;
      }
    }
    
    console.log('✅ PASS: Dependent table policies working correctly');
    return true;
  } catch (error) {
    console.log(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Run all RLS tests
 */
export async function runAllTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('RLS Test Suite');
  console.log('═══════════════════════════════════════════════════\n');
  
  const results = {
    emptySession: await testEmptySession(),
    crossOrgIsolation: await testCrossOrgIsolation(),
    dependentTables: await testDependentTables(),
  };
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('Test Results Summary');
  console.log('═══════════════════════════════════════════════════\n');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`Empty Session Test:        ${results.emptySession ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Cross-Org Isolation Test:  ${results.crossOrgIsolation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Dependent Tables Test:     ${results.dependentTables ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\nTotal: ${passed}/${total} tests passed`);
  
  await prisma.$disconnect();
  
  return passed === total;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then((allPassed) => {
      process.exit(allPassed ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}
