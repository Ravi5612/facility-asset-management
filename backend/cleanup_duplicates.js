const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Starting DB Cleanup for Hardware Details...");
    const assets = await prisma.asset.findMany({
        where: {
            hardwareDetails: { not: {} }
        }
    });

    let updatedCount = 0;
    const keysToRemove = ['ip', 'seat', 'floor', 'process', 'mac'];

    for (const asset of assets) {
        if (!asset.hardwareDetails || typeof asset.hardwareDetails !== 'object') continue;

        let modified = false;
        const details = { ...asset.hardwareDetails };

        for (const key of Object.keys(details)) {
            if (keysToRemove.includes(key.toLowerCase())) {
                delete details[key];
                modified = true;
            }
        }

        if (modified) {
            await prisma.asset.update({
                where: { id: asset.id },
                data: { hardwareDetails: details }
            });
            updatedCount++;
        }
    }

    console.log(`Successfully cleaned up duplicate data in ${updatedCount} assets.`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
