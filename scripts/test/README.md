# Admin Approval Test Scripts

This folder contains scripts to test the admin approval flows for proposed brands and models.

Scripts:

- `admin_approve_flow.sh`: Logs in as admin, creates a listing (which starts a proposed brand/model flow), finds the proposed brand, approves it as a canonical brand (createCanonical: true), then validates that the listing was migrated.

- `admin_approve_single_use_flow.sh`: Same as above, but approves the proposed brand as single-use (createCanonical: false) and validates that the temp brand is marked APPROVED.

Usage:

Set environment variables and run:

```bash
ADMIN_API_URL="https://pairmeup.onrender.com" ADMIN_EMAIL="admin@earbudhub.com" ADMIN_PASS="AdminPass123!" ./scripts/test/admin_approve_flow.sh

# Or for single-use:
ADMIN_API_URL="https://pairmeup.onrender.com" ADMIN_EMAIL="admin@earbudhub.com" ADMIN_PASS="AdminPass123!" ./scripts/test/admin_approve_single_use_flow.sh
```

Notes:

- These scripts create listings and modify DB data; only run against dev/test environments or after explicit approval from production administrators.
- They assume the admin user exists and the seeded admin password is correct. If not, supply a user with admin privileges and valid credentials.
- The scripts require `jq` to be installed.
