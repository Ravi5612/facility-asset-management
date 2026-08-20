-- AlterTable
ALTER TABLE "User" ADD COLUMN "fullName" TEXT;
ALTER TABLE "User" ADD COLUMN "accessibleDepartments" TEXT[] DEFAULT ARRAY[]::TEXT[];
