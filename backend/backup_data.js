const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
    console.log("Starting full database backup...");

    // Add all your models here in logical order
    const data = {
        organizations: await prisma.organization.findMany(),
        departments: await prisma.department.findMany(),
        locations: await prisma.location.findMany(),
        employees: await prisma.employee.findMany(),
        users: await prisma.user.findMany(),
        assetCategories: await prisma.assetCategory.findMany(),
        assets: await prisma.asset.findMany(),
        assetAssignments: await prisma.assetAssignment.findMany(),
        assetMaintenanceLogs: await prisma.assetMaintenanceLog.findMany(),
        tickets: await prisma.ticket.findMany()
    };

    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_${dateStr}.json`;
    const filePath = path.join(__dirname, 'backups', fileName);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`Backup successfully saved to: backups/${fileName}`);
    console.log(`Total Assets Backed Up: ${data.assets.length}`);
    console.log(`Total Assignments Backed Up: ${data.assetAssignments.length}`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
