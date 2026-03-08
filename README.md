# SoilTwin

A comprehensive soil analysis and digital twin platform that combines modern web technologies with soil science research.

---

## 🌍 Project Overview

SoilTwin is a full-stack application designed to provide digital twin representations of soil characteristics and analysis. The project leverages advanced data visualization, real-time analytics, and machine learning capabilities to deliver insights into soil health and properties.

---

## 🏗️ Project Architecture

SoilTwin is built as a monorepo with clearly separated frontend and backend components:

```
SoilTwin/
├── frontend/          # Next.js React application
├── backend/           # Python/TypeScript backend services
├── .gitignore         # Git ignore configuration
└── README.md          # This file
```

---

## 💻 Tech Stack

### Frontend (58% TypeScript)

- **Framework**: Next.js 16.1.6 — React-based framework for production
- **Language**: TypeScript 5 — Type-safe JavaScript

**Styling**
- Tailwind CSS 4 — Utility-first CSS framework
- PostCSS — CSS processing

**UI Components**
- Radix UI React Slider — Accessible slider components
- Lucide React — Icon library

**Charting**
- Recharts 3.7.0 — Composable chart library

**HTTP Client**
- Axios 1.13.6 — Promise-based HTTP client

**Code Quality**
- ESLint 9
- ESLint Config Next

---

### Backend (35% Python)

- **Language**: Python 3
- **TypeScript**: Additional TypeScript support for integration layers
- **Key Capabilities**
  - Machine learning
  - Soil data processing
  - Analytics pipelines

---

### Styling (6% CSS)

- Custom CSS
- Integrated with Tailwind for theming

---

# 🚀 Quick Start

## Prerequisites

- Node.js **18+**
- npm / yarn / pnpm / bun
- Python **3.8+**

---

# Frontend Setup

### 1️⃣ Navigate to frontend

```bash
cd frontend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start development server

```bash
npm run dev
```

or

```bash
yarn dev
pnpm dev
bun dev
```

### 4️⃣ Open in browser

```
http://localhost:3000
```

---

# Frontend Build & Production

### Build

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Run Lint

```bash
npm run lint
```

---

# Backend Setup

*(Backend setup instructions to be documented)*

---

# 📁 Frontend Project Structure

Important frontend files:

```
app/page.tsx          → Main page
next.config.ts        → Next.js configuration
tsconfig.json         → TypeScript configuration
postcss.config.mjs    → PostCSS + Tailwind config
eslint.config.mjs     → ESLint configuration
```

---

# 🎨 Frontend Features

- Responsive UI with Tailwind CSS
- Interactive charts using Recharts
- Accessible UI components using Radix UI
- Fully typed TypeScript architecture
- Next.js App Router

---

# 📊 Language Composition

| Language | Percentage |
|--------|-------------|
| TypeScript | 58% |
| Python | 35.5% |
| CSS | 6% |
| JavaScript | 0.5% |

---

# 📚 Documentation

## Next.js

- https://nextjs.org/docs
- https://nextjs.org/learn
- https://github.com/vercel/next.js

## Tailwind CSS

- https://tailwindcss.com/docs

## Radix UI

- https://www.radix-ui.com/docs/primitives/overview/introduction

## Recharts

- https://recharts.org/

---

# 🚢 Deployment

## Deploy Frontend on Vercel

The easiest way to deploy the Next.js frontend is using **Vercel**.

https://vercel.com/new

More information:

https://nextjs.org/docs/app/building-your-application/deploying

---

# 🛠️ Development Tools

## Linting

```bash
npm run lint
```

## Type Checking

```bash
npm run build
```

---

# 📦 Dependencies Summary

## Production Dependencies

```
next
react
react-dom
axios
recharts
lucide-react
@radix-ui/react-slider
```

---

## Development Dependencies

```
typescript
tailwindcss
@tailwindcss/postcss
eslint
eslint-config-next
@types/react
@types/react-dom
@types/node
```

---

# 📝 Environment Setup

Create `.env.local` inside the frontend directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository  
2. Create a new branch  
3. Submit a Pull Request

---

# 📄 License

This project is open source.

---

# 🔗 Repository Links

Repository  
https://github.com/LakshmiSagar570/SoilTwin

Frontend  
https://github.com/LakshmiSagar570/SoilTwin/tree/main/frontend

Backend  
https://github.com/LakshmiSagar570/SoilTwin/tree/main/backend

---

# 📧 Contact

For questions or collaboration, contact the repository owner.

---

**Last Updated:** March 8, 2026  
**Primary Language:** TypeScript  
**Framework:** Next.js  
**Status:** Active Development
