const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Updating legacy assignment messages...");
    const assignments = await prisma.assetAssignment.findMany({
        where: { conditionOnAssign: { contains: "[System Import]" } },
        include: { asset: { include: { location: { include: { parent: { include: { parent: true } } } } } } }
    });

    console.log(`Found ${assignments.length} assignments to update.`);
    let updated = 0;
    
    for (const a of assignments) {
        if (!a.asset.location) continue;
        
        const seat = a.asset.location;
        const process = seat.parent;
        const floor = process ? process.parent : null;
        
        let locString = `Seat: ${seat.name}`;
        if (floor && process) {
            locString += ` (Floor: ${floor.name}, Process: ${process.name})`;
        } else if (process) {
            locString += ` (Floor/Process: ${process.name})`;
        }
        
        const newCondition = locString;
        
        await prisma.assetAssignment.update({
            where: { id: a.id },
            data: { conditionOnAssign: newCondition }
        });
        
        // Also fix the note on the asset if it has the messy system import string
        if (a.asset.notes && a.asset.notes.includes("[System Import]")) {
            await prisma.asset.update({
                where: { id: a.assetId },
                data: { notes: a.asset.notes.replace(/\[System Import\][\s\S]*?(?=\n\n|$)/g, locString).trim() }
            });
        }
        
        updated++;
    }
    
    console.log(`Successfully updated ${updated} assignments.`);
}

main().finally(() => prisma.$disconnect());
