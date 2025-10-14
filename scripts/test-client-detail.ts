// Test script to simulate accessing a client detail page
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const clientId = "cmgo9w2v7000ofj48n5lkk0zq"; // Testopoulos Test

  console.log(`Testing client detail page for ID: ${clientId}\n`);

  try {
    // Simulate what getClient does
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organizationId: "org_cmgnlymg00000fei1zwcvts6b",
      },
      include: {
        creator: {
          select: { name: true, email: true },
        },
        interactions: {
          include: {
            property: {
              select: {
                id: true,
                propertyType: true,
                address: { select: { city: true, region: true } },
              },
            },
            creator: { select: { name: true } },
          },
          orderBy: { timestamp: "desc" },
        },
        notes: {
          include: {
            creator: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        tasks: {
          include: {
            creator: { select: { name: true } },
            assignee: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      console.log("❌ Client not found or access denied");
      return;
    }

    console.log("✅ Client found!");
    console.log(`   Name: ${client.name}`);
    console.log(`   Type: ${client.clientType}`);
    console.log(`   Email: ${client.email || "N/A"}`);
    console.log(`   Interactions: ${client.interactions.length}`);
    console.log(`   Notes: ${client.notes.length}`);
    console.log(`   Tasks: ${client.tasks.length}`);
    console.log("");

    // Test getting relationships
    const [relationshipsFrom, relationshipsTo] = await Promise.all([
      prisma.clientRelationship.findMany({
        where: { fromClientId: clientId },
        include: {
          toClient: {
            select: {
              id: true,
              name: true,
              clientType: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      prisma.clientRelationship.findMany({
        where: { toClientId: clientId },
        include: {
          fromClient: {
            select: {
              id: true,
              name: true,
              clientType: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
    ]);

    console.log("✅ Relationships retrieved!");
    console.log(`   Outgoing: ${relationshipsFrom.length}`);
    console.log(`   Incoming: ${relationshipsTo.length}`);
    console.log("");

    // Test getting all clients for relationship selection
    const allClients = await prisma.client.findMany({
      where: {
        organizationId: "org_cmgnlymg00000fei1zwcvts6b",
        id: { not: clientId },
      },
      select: {
        id: true,
        name: true,
        clientType: true,
        email: true,
        phone: true,
      },
      take: 1000,
    });

    console.log("✅ Available clients for relationship:");
    console.log(`   Count: ${allClients.length}`);
    allClients.forEach((c) => console.log(`   - ${c.name} (${c.clientType})`));
    console.log("");

    console.log("🎉 All data fetching works correctly!");
    console.log("The client detail page should load without issues.");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
