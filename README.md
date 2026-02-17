# 🇦🇪 CV Hive - UAE CV Library Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> The leading CV library platform connecting UAE job seekers with employers

## 🚀 Quick Start

### 1. Start Docker Services
```powershell
docker-compose up -d
```

### 2. Setup Backend
```powershell
cd backend
npm install
copy .env.example .env
# Edit .env with your credentials
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3. Setup Frontend
```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

### 4. Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🏗️ Tech Stack

- **Backend:** Node.js 20 + TypeScript + Express + Prisma + PostgreSQL
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Search:** Elasticsearch 8
- **Cache:** Redis 7
- **Storage:** AWS S3
- **Payments:** Stripe

## 📚 Documentation

- [Installation](./docs/INSTALLATION.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)

## 🧪 Testing
```powershell
cd backend
npm test
```

## 📄 License

MIT License

---

Made with ❤️ in UAE 🇦🇪
