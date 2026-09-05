const { PrismaClient } = require("@prisma/client");

const prismaOld = new PrismaClient({
    datasources: { db: { url: "postgresql://neondb_owner:npg_7YwcnIQ9VduK@ep-shy-fog-axdgkxsy.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require" } }
});
const prismaNew = new PrismaClient({
    datasources: { db: { url: "postgresql://neondb_owner:npg_CYmceEol0Jt8@ep-lively-surf-aecr2xp9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" } }
});

async function main() {
    console.log("Fetching roles from OLD database...");
    const roles = await prismaOld.role.findMany();
    const userRoles = await prismaOld.userRole.findMany();
    
    console.log(`Found ${roles.length} roles and ${userRoles.length} user roles.`);
    
    console.log("Inserting into NEW database...");
    if (roles.length > 0) {
        await prismaNew.role.createMany({ data: roles, skipDuplicates: true });
    }
    if (userRoles.length > 0) {
        await prismaNew.userRole.createMany({ data: userRoles, skipDuplicates: true });
    }
    
    console.log("Roles successfully restored!");
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => {
        await prismaOld.$disconnect();
        await prismaNew.$disconnect();
    });
