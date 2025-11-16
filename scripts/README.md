# RoleRabbit Scripts

Utility scripts for setup, testing, and maintenance.

## Setup Scripts

### `setup.sh` - Initial Setup & Activation

Automates the initial setup process including:
- Installing dependencies
- Configuring Git hooks
- Generating environment variables
- Running database migrations
- Creating admin user

**Usage:**

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## Testing Scripts

### `test-apis.sh` - API Endpoint Testing

Tests all API endpoints to verify they're working correctly.

**Usage:**

```bash
# Test public endpoints only
chmod +x scripts/test-apis.sh
./scripts/test-apis.sh

# Test authenticated endpoints (requires token)
TOKEN=your-jwt-token ./scripts/test-apis.sh

# Test against different environment
BASE_URL=https://staging.rolerabbit.com TOKEN=your-token ./scripts/test-apis.sh
```

## Maintenance Scripts

### `process-deletions.ts` - Scheduled Account Deletion

Processes pending account deletion requests that have passed the 30-day grace period.

**Usage:**

```bash
# Run manually
npx ts-node scripts/process-deletions.ts

# Or add to crontab (daily at 2 AM)
0 2 * * * cd /path/to/RoleRabbit && npx ts-node scripts/process-deletions.ts
```

### `cleanup-audit-logs.ts` - Audit Log Retention

Removes audit logs older than 1 year (configurable).

**Usage:**

```bash
# Run manually
npx ts-node scripts/cleanup-audit-logs.ts

# Or add to crontab (weekly on Sunday at 3 AM)
0 3 * * 0 cd /path/to/RoleRabbit && npx ts-node scripts/cleanup-audit-logs.ts
```

## Creating New Scripts

When creating new scripts:

1. Add proper error handling
2. Use descriptive names
3. Include help text
4. Make scripts executable: `chmod +x script-name.sh`
5. Document in this README
6. Add to appropriate section

## Environment Variables

Scripts may use these environment variables:

- `BASE_URL` - API base URL (default: http://localhost:3000)
- `DATABASE_URL` - PostgreSQL connection string
- `TOKEN` - JWT authentication token
- `NODE_ENV` - Environment (development/production)

## Troubleshooting

If scripts fail:

1. Check file permissions: `ls -la scripts/`
2. Make executable: `chmod +x scripts/script-name.sh`
3. Verify environment variables are set
4. Check logs for error messages
5. See [TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)
