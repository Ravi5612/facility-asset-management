
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Get all ASSIGNED assets that have no locationId but have hardwareDetails with seat info
  const assets = await prisma.asset.findMany({
    where: { status: "ASSIGNED", locationId: null }
  });

  console.log("Assets with no locationId:", assets.length);

  let fixed = 0;
  for (const asset of assets) {
    const hw = asset.hardwareDetails;
    if (!hw || !hw.seat) continue;

    const seatLoc = await prisma.location.findFirst({
      where: { name: { equals: hw.seat, mode: "insensitive" }, type: "DESK", organizationId: asset.organizationId }
    });

    if (seatLoc) {
      await prisma.asset.update({ where: { id: asset.id }, data: { locationId: seatLoc.id } });
      fixed++;
    }
  }

  console.log("Fixed " + fixed + " assets with locationId from hardwareDetails.seat");

  // Also fix assets that are ASSIGNED and have locationId already but lets check peripherals
  // For peripherals (mouse/keyboard/monitor) that were assigned, check AssetAssignment conditionOnAssign or notes for seat info
  const peripherals = await prisma.asset.findMany({
    where: { status: "ASSIGNED", locationId: null },
    include: { assignments: { where: { status: "ACTIVE" }, include: { employee: true } } }
  });

  console.log("Remaining peripherals with no location:", peripherals.length);
}

main().finally(() => prisma.$disconnect());

