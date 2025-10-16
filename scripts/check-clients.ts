import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking clients in database...\n");

  const clients = await prisma.client.findMany({
    include: {
      creator: {
        select: { name: true, email: true },
      },
      _count: {
        select: {
          interactions: true,
          notes: true,
          tasks: true,
        },
      },
    },
  });

  console.log(`Total clients in database: ${clients.length}\n`);

  for (const client of clients) {
    console.log(`Client: ${client.name} (${client.id})`);
    console.log(`  Type: ${client.clientType}`);
    console.log(`  Email: ${client.email || "N/A"}`);
    console.log(`  Phone: ${client.phone || "N/A"}`);
    console.log(`  Organization ID: ${client.organizationId}`);
    console.log(`  Created by: ${client.creator.name || client.creator.email}`);
    console.log(`  Interactions: ${client._count.interactions}`);
    console.log(`  Notes: ${client._count.notes}`);
    console.log(`  Tasks: ${client._count.tasks}`);
    console.log("");
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
