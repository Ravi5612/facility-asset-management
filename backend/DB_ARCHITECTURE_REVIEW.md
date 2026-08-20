# Asset Management System - Database Architecture Review (v2.0)

This document outlines the database architecture, schema design, and production-level invariants implemented for the Asset Management System. Please review this to ensure it meets the standard for a scalable, multi-tenant SaaS application.

## 1. Core Architecture: Multi-Tenancy
To support multiple companies (SaaS model) securely, we implemented a **Row-Level Multi-Tenancy** model:
- **`organizationId` in every business table**: All tables (except global configurations/permissions) include an `organizationId`.
- **Tenant Context**: Every API request will extract the `organizationId` from the JWT and inject it into Prisma queries.
- **Why**: This prevents massive migrations if the app scales to support multiple companies tomorrow. It ensures complete data isolation.

## 2. Advanced Database Safeguards (Raw SQL Invariants)
Prisma is great, but it lacks support for certain advanced database constraints. To make the DB truly production-ready and bulletproof against application-layer bugs, we added the following via Raw SQL Migrations:

### A. Tenant-Consistent Foreign Keys (Composite Keys)
It is theoretically possible for an application bug to assign an `Employee` from "Company A" to an `Asset` in "Company B". To prevent this *at the database level*, we enforced Composite Foreign Keys:
- Target tables (`Employee`, `AssetCategory`, `Location`) have a `UNIQUE("id", "organizationId")` constraint.
- Foreign keys require both IDs to match. 
*Example:* 
```sql
ALTER TABLE "Asset" ADD CONSTRAINT "fk_asset_currentAssignee_tenant"
  FOREIGN KEY ("currentAssigneeId", "organizationId")
  REFERENCES "Employee" ("id", "organizationId");
```
*Result:* Cross-tenant data corruption is mathematically impossible.

### B. Partial Unique Indexes
- **Single Active Assignment**: An asset can have a history of assignments, but only *one* can be active at a time.
```sql
CREATE UNIQUE INDEX "one_active_assignment_per_asset" 
ON "AssetAssignment" ("assetId") 
WHERE "status" = 'ACTIVE';
```
- **Soft-Delete Unique Codes**: Asset codes and Department codes must be unique, but if a record is soft-deleted, that code can be reused.
```sql
CREATE UNIQUE INDEX "unique_assetcode_active" 
ON "Asset" ("organizationId", "assetCode") 
WHERE "deletedAt" IS NULL;
```

## 3. Schema Highlights & Fixes
- **Strict 1-to-1 Relationships**: Fixed the `User` <-> `Employee` relationship ensuring a User maps exactly to one Employee with a strict `@unique` constraint.
- **Unambiguous Relations**: Resolved Prisma ambiguities for `Ticket` and `Department` (distinguishing between `raisedBy` and `assignedTo` relations).
- **Soft Delete Policy**: Implemented `deletedAt` DateTime fields on all primary entities (`User`, `Asset`, `Employee`, `Ticket`). History tables like `AuditLog` and `TicketStatusHistory` are immutable (append-only) and do not have soft deletes.

## 4. RBAC (Role-Based Access Control)
- Granular permissions (`Permission` table).
- Organization-specific roles (`Role` table).
- `UserRole` mapping includes `assignedBy`, `assignedAt`, and revocation history (`revokedBy`, `revokedAt`) for strict security auditing.

## 5. Audit Logging
- Dedicated `AuditLog` table designed to be append-only.
- Uses `organizationId` and `actorUserId` as plain strings (not Foreign Keys) so that if a user is hard-deleted in the future, the audit history remains intact and doesn't break due to constraint violations.

---
**Status**: The schema has been successfully pushed and synced with the PostgreSQL database. All migrations and Raw SQL constraints executed without errors.
