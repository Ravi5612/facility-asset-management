-- PostgreSQL requires a UNIQUE constraint before creating a composite FK
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_id_org_unique" UNIQUE ("id", "organizationId");
ALTER TABLE "AssetCategory" ADD CONSTRAINT "AssetCategory_id_org_unique" UNIQUE ("id", "organizationId");
ALTER TABLE "Location" ADD CONSTRAINT "Location_id_org_unique" UNIQUE ("id", "organizationId");

-- Composite tenant-consistent foreign keys
ALTER TABLE "User" ADD CONSTRAINT "fk_user_employee_tenant"
  FOREIGN KEY ("employeeId", "organizationId")
  REFERENCES "Employee" ("id", "organizationId")
  ON DELETE SET NULL;

ALTER TABLE "Asset" ADD CONSTRAINT "fk_asset_currentAssignee_tenant"
  FOREIGN KEY ("currentAssigneeId", "organizationId")
  REFERENCES "Employee" ("id", "organizationId")
  ON DELETE SET NULL;

ALTER TABLE "Asset" ADD CONSTRAINT "fk_asset_category_tenant"
  FOREIGN KEY ("categoryId", "organizationId")
  REFERENCES "AssetCategory" ("id", "organizationId")
  ON DELETE RESTRICT;

ALTER TABLE "Location" ADD CONSTRAINT "fk_location_parent_tenant"
  FOREIGN KEY ("parentLocationId", "organizationId")
  REFERENCES "Location" ("id", "organizationId")
  ON DELETE SET NULL;

-- Partial unique indexes
CREATE UNIQUE INDEX "one_active_assignment_per_asset" 
ON "AssetAssignment" ("assetId") 
WHERE "status" = 'ACTIVE';

CREATE UNIQUE INDEX "unique_assetcode_active" 
ON "Asset" ("organizationId", "assetCode") 
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "unique_category_name_active" 
ON "AssetCategory" ("organizationId", "name") 
WHERE "deletedAt" IS NULL;