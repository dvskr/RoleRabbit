#!/bin/bash
# RoleRabbit Setup Script
# Automates initial setup and activation

set -e  # Exit on error

echo "🚀 RoleRabbit Setup & Activation"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

cd apps/web
npm install bcryptjs isomorphic-dompurify zod
npm install --save-dev @types/bcryptjs husky lint-staged @commitlint/cli @commitlint/config-conventional
cd ../..

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Initialize Husky
echo "🪝 Step 2: Setting up Git hooks..."
npx husky install
chmod +x .husky/pre-commit 2>/dev/null || true
chmod +x .husky/commit-msg 2>/dev/null || true
echo -e "${GREEN}✓ Git hooks configured${NC}"
echo ""

# Generate environment file if it doesn't exist
if [ ! -f "apps/web/.env.local" ]; then
    echo "⚙️  Step 3: Creating .env.local file..."

    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

    cat > apps/web/.env.local <<EOF
# Database (Update with your database URL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rolerabbit

# Supabase (Uncomment and update if using Supabase)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
JWT_SECRET=${JWT_SECRET}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=http://localhost:3000

# Encryption
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# Rate Limiting (Optional - Redis)
# REDIS_URL=redis://localhost:6379

# Email (Update with your SMTP details)
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=your-smtp-user
# SMTP_PASSWORD=your-smtp-password
# SMTP_FROM=noreply@rolerabbit.com

# Environment
NODE_ENV=development
EOF

    echo -e "${GREEN}✓ Created .env.local with generated secrets${NC}"
    echo -e "${YELLOW}⚠️  Please update DATABASE_URL in apps/web/.env.local${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local already exists, skipping...${NC}"
fi
echo ""

# Database migrations
echo "🗄️  Step 4: Database migrations"
echo -e "${YELLOW}Do you want to run database migrations now? (y/n)${NC}"
read -r run_migrations

if [ "$run_migrations" = "y" ]; then
    echo "Enter your database URL (or press Enter to use .env.local):"
    read -r db_url

    if [ -z "$db_url" ]; then
        # Load from .env.local
        export $(cat apps/web/.env.local | grep DATABASE_URL | xargs)
        db_url=$DATABASE_URL
    fi

    if [ -n "$db_url" ]; then
        echo "Running migrations..."
        psql "$db_url" -f apps/web/src/database/migrations/018_create_audit_and_privacy_tables.sql
        psql "$db_url" -f apps/web/src/database/migrations/019_create_moderation_and_security_tables.sql
        echo -e "${GREEN}✓ Migrations completed${NC}"
    else
        echo -e "${RED}Error: No database URL provided${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping migrations. Run manually later.${NC}"
fi
echo ""

# Create admin user
echo "👤 Step 5: Admin user setup"
echo -e "${YELLOW}Do you want to create an admin user? (y/n)${NC}"
read -r create_admin

if [ "$create_admin" = "y" ]; then
    echo "Enter admin email:"
    read -r admin_email

    echo "Enter admin password:"
    read -s admin_password
    echo ""

    if [ -n "$admin_email" ] && [ -n "$admin_password" ]; then
        cat > /tmp/seed_admin.sql <<EOF
INSERT INTO auth.users (id, email, encrypted_password, role, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '$admin_email',
  crypt('$admin_password', gen_salt('bf')),
  'admin',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
EOF

        if [ -n "$db_url" ]; then
            psql "$db_url" -f /tmp/seed_admin.sql
            rm /tmp/seed_admin.sql
            echo -e "${GREEN}✓ Admin user created${NC}"
        else
            echo -e "${YELLOW}⚠️  Database URL not set. Admin user not created.${NC}"
            echo "Run this SQL manually:"
            cat /tmp/seed_admin.sql
            rm /tmp/seed_admin.sql
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Skipping admin user creation${NC}"
fi
echo ""

# Build and start
echo "🏗️  Step 6: Building application..."
npm run build

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update DATABASE_URL in apps/web/.env.local if needed"
echo "2. Review ACTIVATION_GUIDE.md for detailed instructions"
echo "3. Start the development server:"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "4. Test the API endpoints:"
echo "   - Health check: http://localhost:3000/api/health"
echo "   - API docs: http://localhost:3000/api-docs"
echo ""
echo "5. Create admin account at: http://localhost:3000/register"
echo ""
echo "For troubleshooting, see docs/TROUBLESHOOTING.md"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
