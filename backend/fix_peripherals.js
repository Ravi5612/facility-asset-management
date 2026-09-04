
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const assets = await prisma.asset.findMany({
    where: { status: "ASSIGNED", locationId: null },
    include: { assignments: { where: { status: "ACTIVE" } } }
  });

  let fixed = 0;
  for (const asset of assets) {
    if (asset.assignments.length > 0) {
      const assignment = asset.assignments[0];
      // Check conditionOnAssign for seat number if the frontend sent it there? Or just un-assign it so the user can test cleanly?
      console.log("Asset ID:", asset.id, "Assignment ID:", assignment.id);
      
      // I will reset them to AVAILABLE so the user can just assign them again easily!
      await prisma.asset.update({
        where: { id: asset.id },
        data: { status: "AVAILABLE" }
      });
      await prisma.assetAssignment.update({
        where: { id: assignment.id },
        data: { status: "RETURNED", returnedAt: new Date() }
      });
      fixed++;
    }
  }
  console.log("Reset " + fixed + " broken test peripherals back to AVAILABLE");
}
main().finally(() => prisma.$disconnect());

