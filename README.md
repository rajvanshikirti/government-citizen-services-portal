# Government Citizen Services Portal

A production-ready full-stack portal for citizens to apply for government services, track applications, and verify certificates online.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite |
| **Backend** | **C# (.NET 8 ASP.NET Core Web API)** |
| **Database** | PostgreSQL (Neon Cloud / Local) |
| **ORM** | Entity Framework Core (Npgsql) |
| **Auth** | JWT Bearer Tokens |
| **PDF & QR** | QuestPDF & QRCoder |

---

## Project Structure

```
├── backend/                       # C# (.NET 8 ASP.NET Core Web API)
│   ├── Controllers/               # REST API Controllers (Auth, Applications, Services, Documents)
│   ├── Data/                      # EF Core DbContext & Initializer
│   ├── Dtos/                      # Type-safe API Request/Response DTOs
│   ├── Models/                    # Entity Data Models (User, Application, Document, etc.)
│   ├── Services/                  # Business Logic (JWT, Certificate PDF Generator, Reports)
│   ├── Program.cs                 # Web API Entry Point
│   └── Dockerfile                 # Multi-stage C# .NET 8 Docker Build
├── frontend/                      # React 19 SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── contexts/              # Auth, Theme, Language
│   │   ├── pages/                 # Route pages
│   │   └── services/              # API client
│   ├── nginx.conf                 # Production Nginx Reverse Proxy Config
│   └── Dockerfile                 # Frontend Production Container
└── docker-compose.prod.yml        # Production Docker Stack
```

---

## Quick Start (Docker Deployment)

### Prerequisites

- Docker & Docker Compose

### 1. Launch Stack

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **Swagger Documentation**: http://localhost:5000/swagger

---

## License

Government of India — Internal Use
