# Admin Approval Flow — Canonical vs Single-Use

This document explains how the admin flows work for approving proposed brands and models, and how the frontend and API behave during approval.

## Summary
- When a user creates a listing with an unknown brand or model, the backend creates a `ProposedBrand` / `ProposedModel` and a temporary `brand`/`model` entry whose `slug` starts with `temp-<proposedId>` and status `PENDING`. This ensures listings can exist while awaiting admin review.
- Admins can either:
  - Create a canonical `APPROVED` brand/model and migrate existing listings and temp models to the canonical entry, or
  - Approve the temporary `brand`/`model` as `APPROVED` for single-use without creating a canonical entry.

## API Endpoints
- GET /admin/proposed-brands — list pending proposals
- GET /admin/proposed-models — list pending model proposals
- POST /admin/proposed-brands/:id/approve — approve a proposed brand
  - Body: { createCanonical?: boolean, name?: string, description?: string, website?: string }
  - Behavior: Default `createCanonical` is true. If `true` the backend creates a canonical brand and migrates listings. If `false`, the backend marks the temporary brand(s) as `APPROVED`.
- POST /admin/proposed-brands/:id/reject — reject a proposed brand
- POST /admin/proposed-models/:id/approve — approve a proposed model
  - Body: { createCanonical?: boolean, name?: string, description?: string }
  - Behavior mirrors brand approval for models (canonical creation vs single-use approval).
- POST /admin/proposed-models/:id/reject — reject a proposed model

## How the frontend is updated
- Admin UI (apps/web) includes confirmation prompts for 'Create canonical' vs 'Single-use' and optional fields to edit name/description/website before approval.
- The web admin proxy forwards the request body to the backend.

## Testing
- Example manual test scripts are included in `scripts/test/`:
  - `admin_approve_flow.sh` — creates a listing with a custom brand/model, then approves the proposed brand as canonical and verifies the listing was migrated.
  - `admin_approve_single_use_flow.sh` — approves the proposed brand as single-use and verifies the temporary brand is marked `APPROVED`.

> Note: These scripts create listings and modify DB data. Only run them against test environments or with admin approval if using production.

## Audits
- Creating a canonical brand/model logs a `CREATE` audit entry to `brandAudit`/`modelAudit` tables respectively.
- Reassigning a model to a different brand logs an `UPDATE` audit entry for `brandId`.

## Caveats
- Approvals are transactional — either the migration and creation succeed entirely, or the operation will fail and rollback.
- Slug generation is basic: lowercases the name and replaces non-alphanumeric characters with `-`. Check collisions and adapt if you need a more robust slug strategy.
- The seed ensures `SYSTEM` brands are created idempotently; re-running seed will set `status: SYSTEM` and `isVerified: true` on seeded brands.
