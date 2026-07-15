# Government Citizen Services Portal

A production-ready full-stack portal for citizens to apply for government services, track applications, and verify certificates online.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (Bearer tokens) |

## Features

- **Role-based access**: Citizen, Officer, Admin
- **8 Government Services**: Birth/Death/Income/Caste certificates, Property Tax, Water/Electricity connections, Driving Licence renewal
- **Application lifecycle**: Draft → Submit → Review → Approve/Reject → Certificate
- **Document upload** (PDF, JPEG, PNG)
- **PDF certificate generation** with QR code verification
- **Email notifications** (SMTP configurable)
- **Reports & analytics** dashboard
- **Dark mode** and **multi-language** (English/Hindi)
- **WCAG accessibility** (ARIA labels, focus states, semantic HTML)
- **Rate limiting**, Helmet security headers, input validation (Zod)

## Project Structure

```
├── backend/                 # Express API (Clean Architecture)
│   ├── prisma/              # Database schema & seed
│   └── src/
│       ├── config/          # Environment, logging
│       ├── domain/          # Entities, interfaces
│       ├── application/     # Business logic services
│       ├── infrastructure/  # Database, JWT, email, PDF
│       └── presentation/    # Routes, controllers, middleware
├── frontend/                # React SPA
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── contexts/        # Auth, Theme, Language
│       ├── pages/           # Route pages
│       ├── services/        # API client
│       └── i18n/            # Translations
└── docker-compose.yml       # PostgreSQL container
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL) or a local PostgreSQL instance

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

### 3. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 4. Setup database

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@example.com | Password@123 |
| Officer | officer@govportal.gov | Password@123 |
| Admin | admin@govportal.gov | Password@123 |

## API Documentation

See [docs/API.md](docs/API.md) for the full REST API reference.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run build` | Build for production |
| `npm test` | Run all tests |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## Architecture

The backend follows **Clean Architecture** principles:

- **Domain**: Core business entities and error types
- **Application**: Use-case services (auth, applications, reports)
- **Infrastructure**: External concerns (Prisma, JWT, email, PDF)
- **Presentation**: HTTP layer (routes, controllers, validation)

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT authentication with configurable expiry
- Role-based authorization middleware
- Rate limiting (100 req/15 min)
- Helmet security headers
- Input validation with Zod schemas
- File upload type and size restrictions
- Environment variables for secrets

## License

Government of India — Internal Use
