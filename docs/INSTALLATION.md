# Installation Guide

## Prerequisites

- Node.js 20+
- Docker Desktop
- Git

## Setup Steps

### 1. Start Docker Services
```powershell
docker-compose up -d
```

### 2. Install Backend
```powershell
cd backend
npm install
copy .env.example .env
# Edit .env file with your credentials
npx prisma generate
npx prisma migrate dev
```

### 3. Install Frontend
```powershell
cd frontend
npm install
copy .env.example .env
```

### 4. Run Development Servers

Backend:
```powershell
cd backend
npm run dev
```

Frontend (new terminal):
```powershell
cd frontend
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Prisma Studio: npx prisma studio

## Troubleshooting

**Docker not starting?**
- Ensure Docker Desktop is running
- Check ports 5432, 6379, 9200 are not in use

**Database connection errors?**
- Verify PostgreSQL container is running: docker ps
- Check DATABASE_URL in .env

**Frontend not loading?**
- Clear node_modules: rm -rf node_modules && npm install
- Check port 3000 is available
