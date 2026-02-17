# Architecture Overview

## System Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│  PostgreSQL │
│ (React App) │     │  (Express)   │     │  Database   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ├──────▶ Redis (Cache)
                           │
                           ├──────▶ Elasticsearch (Search)
                           │
                           └──────▶ AWS S3 (Storage)
```

## Tech Stack

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 15 + Prisma ORM
- **Search:** Elasticsearch 8
- **Cache:** Redis 7
- **Storage:** AWS S3
- **Payments:** Stripe

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS
- **State:** Zustand + React Query
- **Routing:** React Router

### Infrastructure
- **Containers:** Docker + Docker Compose
- **Cloud:** AWS (ECS, RDS, ElastiCache)
- **IaC:** Terraform
- **CI/CD:** GitHub Actions

## Database Schema

Key tables:
- **users** - Authentication
- **candidates** - Job seeker profiles
- **employers** - Company profiles
- **subscriptions** - Payment plans
- **downloads** - CV download tracking

See prisma/schema.prisma for full schema.
