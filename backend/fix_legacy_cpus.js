const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    const org = await prisma.organization.findFirst();
    const dept = await prisma.department.findFirst({ where: { name: { contains: "information technology", mode: "insensitive" } } });
    const user = await prisma.user.findFirst();
    console.log("Fixing legacy CPUs...");
    const cpus = await prisma.asset.findMany({
        where: { category: { name: { contains: "cpu", mode: "insensitive" } }, ownerDepartmentId: null }
    });
    console.log(`Found ${cpus.length} CPUs to fix.`);
    let fixedCount = 0;
    for (const cpu of cpus) {
        const status = cpu.locationId ? "ASSIGNED" : "AVAILABLE";
        await prisma.asset.update({
            where: { id: cpu.id },
            data: { ownerDepartmentId: dept.id, status: status }
        });
        if (cpu.locationId) {
            const loc = await prisma.location.findUnique({ where: { id: cpu.locationId } });
            if (loc) {
                const existing = await prisma.assetAssignment.findFirst({ where: { assetId: cpu.id }});
                if (!existing) {
                    await prisma.assetAssignment.create({
                        data: {
                            organizationId: org.id,
                            assetId: cpu.id,
                            assignedById: user.id,
                            status: "ACTIVE",
                            conditionOnAssign: `[System Import]\n- Assigned to Seat: ${loc.name}\n- Notes: Legacy bulk import`,
                            assignedAt: new Date(cpu.createdAt || new Date())
                        }
                    });
                }
            }
        }
        fixedCount++;
        if (fixedCount % 100 === 0) console.log(`Fixed ${fixedCount}...`);
    }
    console.log(`Successfully fixed ${fixedCount} CPUs.`);
}
main().finally(() => prisma.$disconnect());
