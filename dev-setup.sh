#!/bin/bash
# EarbudHub Development Setup Script

set -e

echo "🚀 EarbudHub Development Setup"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is running
print_status "Checking PostgreSQL..."
if ! sudo systemctl is-active --quiet postgresql; then
    print_warning "PostgreSQL is not running. Starting it..."
    sudo systemctl start postgresql
    print_success "PostgreSQL started"
else
    print_success "PostgreSQL is running"
fi

# Check if database exists
print_status "Checking database..."
if ! psql -h localhost -U postgres -d earbudhub -c "\q" 2>/dev/null; then
    print_warning "Database 'earbudhub' doesn't exist or credentials are wrong"
    print_status "You may need to:"
    echo "  1. Reset postgres password: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\""
    echo "  2. Create database: sudo -u postgres createdb earbudhub"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "Database connection working"
fi

# Generate Prisma client
print_status "Generating Prisma client..."
cd packages/db
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/earbudhub?schema=public" npx prisma generate
print_success "Prisma client generated"

# Run migrations if needed
print_status "Checking database schema..."
if ! DATABASE_URL="postgresql://postgres:postgres@localhost:5432/earbudhub?schema=public" npx prisma migrate status | grep -q "Database schema is up to date"; then
    print_warning "Database needs migration"
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/earbudhub?schema=public" npx prisma migrate deploy
    print_success "Database migrated"
else
    print_success "Database schema is up to date"
fi

# Check if database has data
cd ../..
if ! psql -h localhost -U postgres -d earbudhub -c "SELECT COUNT(*) FROM brands;" | grep -q "[1-9]"; then
    print_status "Seeding database..."
    cd packages/db
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/earbudhub?schema=public" npm run db:seed
    cd ../..
    print_success "Database seeded"
else
    print_success "Database already has data"
fi

# Install dependencies if needed
print_status "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

print_success "Setup complete! Starting development servers..."
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:4000"
echo "📚 API Documentation at: http://localhost:4000/api/docs"
echo ""
print_status "Starting servers with concurrently..."
echo ""

# Start development servers
npm run dev
