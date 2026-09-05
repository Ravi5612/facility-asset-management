const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
    const backupFile = process.argv[2];
    const filePath = path.join(__dirname, 'backups', backupFile);

    console.log("Reading backup file...");
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    console.log("Starting restore process...");

    // Delete existing
    await prisma.ticket.deleteMany();
    await prisma.assetMaintenanceLog.deleteMany();
    await prisma.assetAssignment.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.assetCategory.deleteMany();
    await prisma.user.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.location.deleteMany();
    await prisma.department.deleteMany();
    await prisma.organization.deleteMany();
    
    console.log("Database cleared. Inserting backup data...");

    // Strip hodId to avoid circular dependency
    const departmentsBackup = [];
    const deptsWithHod = [];
    if (data.departments) {
        for (const d of data.departments) {
            if (d.hodId) deptsWithHod.push({ id: d.id, hodId: d.hodId });
            departmentsBackup.push({ ...d, hodId: null });
        }
    }

    if (data.organizations?.length) await prisma.organization.createMany({ data: data.organizations });
    if (departmentsBackup.length) await prisma.department.createMany({ data: departmentsBackup });
    if (data.locations?.length) await prisma.location.createMany({ data: data.locations });
    if (data.employees?.length) await prisma.employee.createMany({ data: data.employees });
    if (data.users?.length) await prisma.user.createMany({ data: data.users });
    if (data.assetCategories?.length) await prisma.assetCategory.createMany({ data: data.assetCategories });
    if (data.assets?.length) await prisma.asset.createMany({ data: data.assets });
    if (data.assetAssignments?.length) await prisma.assetAssignment.createMany({ data: data.assetAssignments });
    if (data.assetMaintenanceLogs?.length) await prisma.assetMaintenanceLog.createMany({ data: data.assetMaintenanceLogs });
    if (data.tickets?.length) await prisma.ticket.createMany({ data: data.tickets });

    // Restore hodIds
    if (deptsWithHod.length) {
        console.log("Restoring department HODs...");
        for (const d of deptsWithHod) {
            await prisma.department.update({
                where: { id: d.id },
                data: { hodId: d.hodId }
            });
        }
    }

    console.log("Restore completed successfully!");
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
