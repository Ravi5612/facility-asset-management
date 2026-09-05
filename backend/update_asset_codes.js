const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Updating existing CPU asset codes to 4-digit format...");
    const cpus = await prisma.asset.findMany({
        where: { category: { name: { contains: "cpu", mode: "insensitive" } } }
    });

    let counter = 1000;
    let updatedCount = 0;
    
    for (const cpu of cpus) {
        // Generate new 4-digit code sequentially to avoid collisions
        const newCode = `CPU-${counter}`;
        await prisma.asset.update({
            where: { id: cpu.id },
            data: { assetCode: newCode }
        });
        counter++;
        updatedCount++;
    }
    console.log(`Successfully updated ${updatedCount} CPU asset codes.`);
}

main().finally(() => prisma.$disconnect());
