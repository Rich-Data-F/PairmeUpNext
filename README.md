# EarbudHub Marketplace

Professional earbud parts marketplace with lost/stolen registry and legal compliance workflow.

## 🚀 Project Overview

EarbudHub is a comprehensive marketplace platform for buying, selling, and finding individual earbuds, charging cases, and accessories. The platform includes:

- **Secure Marketplace** - Buy and sell earbud parts with verified users
- **Lost & Found Registry** - Smart matching algorithm to reunite users with lost items
- **Found Items Workflow** - Legal compliance system with jurisdiction-specific waiting periods
- **Advanced Ratings** - 12+ criteria rating system with weighted scoring
- **Trust Features** - Identifier masking, verification badges, escrow payments
- **Blog System** - Brand and model-focused content with SEO optimization

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript, Swagger documentation
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payment**: PayPal Orders v2 API with escrow simulation
- **Geolocation**: GeoDB Cities API
- **File Upload**: MinIO (S3-compatible)
- **Deployment**: Railway (Backend) + Vercel (Frontend)

### Project Structure
```
├── apps/
│   ├── api/                 # NestJS Backend
│   └── web/                 # Next.js Frontend
├── packages/
│   └── db/                  # Shared Prisma Database
└── docker-compose.yml       # Development Services
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm 9+
- Docker & Docker Compose
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd PairAgainNext
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development services**
```bash
npm run docker:up
```

4. **Setup database**
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. **Start development servers**
```bash
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api/docs
- Database Studio: `npm run db:studio`

### Environment Configuration

Copy and configure environment files:
```bash
# Backend
cp apps/api/.env.development apps/api/.env.local

# Frontend  
cp apps/web/.env.development apps/web/.env.local

# Database
cp packages/db/.env.development packages/db/.env.local
```

Update the environment variables with your API keys and configuration.

## 📊 Database Schema

The system uses a comprehensive PostgreSQL schema with the following main entities:

- **User** - Authentication and user management
- **Brand/Model** - Product catalog with technical specifications
- **City** - GeoDB Cities integration for location services
- **Listing** - Marketplace items with encrypted identifiers
- **LostReport** - Lost/stolen item registry with smart matching
- **FoundItem** - Found items with legal compliance workflow
- **Rating** - Advanced 12+ criteria rating system
- **BlogPost** - Content management with brand/model taxonomy
- **Order** - PayPal payment processing with escrow

## 🎯 Key Features

### Marketplace
- Individual earbud and charging case listings
- Photo verification and identifier masking
- Advanced search with brand, model, condition, location filters
- Secure escrow-style payments via PayPal

### Lost & Found Registry
- Report lost items with evidence upload
- Smart matching algorithm using identifiers and location
- Privacy controls for location and contact sharing
- Reward system for found items

### Legal Compliance (Found Items)
- Jurisdiction-specific waiting periods (France: 3 years, US: 90 days)
- Authority reporting workflow with evidence tracking
- Owner claim process with verification
- Automatic conversion to marketplace after waiting period

### Trust & Security
- Identifier encryption and masking (****E5F6 format)
- User verification badges and reputation system
- Rate limiting and fraud detection
- Comprehensive admin moderation tools

## 🚀 Deployment

### Railway (Backend)
```bash
# Deploy to Railway
railway up --service api
```

### Vercel (Frontend)
```bash
# Deploy to Vercel
vercel --prod
```

### Environment Variables

**Railway (Backend)**:
- `DATABASE_URL`: PostgreSQL connection string
- `PAYPAL_CLIENT_ID/SECRET`: PayPal API credentials
- `JWT_SECRET`: 32+ character secret for authentication
- `ID_ENCRYPTION_KEY`: 32+ character key for identifier encryption

**Vercel (Frontend)**:
- `NEXT_PUBLIC_API_URL`: Railway backend URL
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`: PayPal client ID
- `NEXTAUTH_SECRET`: NextAuth.js secret
- `DATABASE_URL`: PostgreSQL connection (for NextAuth)

## 📚 API Documentation

Interactive API documentation is available at `/api/docs` when running the backend.

Key endpoints:
- `GET /brands` - List all brands
- `GET /models` - List all models  
- `GET /listings` - Search marketplace listings
- `POST /lost-reports` - Report lost items
- `POST /found-items` - Register found items
- `POST /ratings` - Submit product ratings

## 🧪 Testing

```bash
# Run all tests
npm run test

# Backend tests
npm run test:api

# Frontend tests  
npm run test:web

# Database tests
cd packages/db && npm run test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@earbudhub.com
- Documentation: https://docs.earbudhub.com
- Issues: GitHub Issues
