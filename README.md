# 🏫 Wehu CBC School Management System

**The definitive academic engine for Kenya's Competency Based Curriculum (CBC).**

Wehu SMS is a premium, high-performance school management platform designed specifically for the unique requirements of the KICD CBC curriculum. It streamlines everything from student admission and fee collection to weekly academic reporting and automated report card generation.

## 🚀 Key Features

### 🎓 Academic CBC Engine
- **KICD Seeding**: Pre-loaded with Grade 1–9 strands and learning outcomes.
- **Formative Assessment**: EE/ME/AE/BE rating matrix for teachers.
- **Auto-Reporting**: Friday weekly progress summaries for parents.
- **Improvement Roadmap**: AI-driven learning material suggestions based on student gaps.

### 💰 Billing & Finance
- **Dynamic Fees**: Custom structures per grade level.
- **Transaction History**: Installment tracking and automated arrears lists.
- **Secure Payments**: M-Pesa/Bank reference logging.

### 🗓️ School Operations
- **Timetable Builder**: Conflict-free grid scheduling.
- **Attendance Register**: Digital per-subject status marking.
- **Admin Control**: Bulk student promotions and executive financial summaries.

### 📱 Modern Technology
- **PWA & Offline Mode**: Installable app with service worker caching for remote reliability.
- **Premium Dark UI**: Bespoke glassmorphism design with Framer Motion animations.
- **Multi-Channel Alerts**: SMS (Africa's Talking) and Email notifications.

---

## 🛠️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Africa's Talking API Key (for SMS)

### 2. Installation
```bash
# Install all dependencies
npm run install-all

# Setup database
cd backend
npx prisma migrate dev
npm run seed
```

### 3. Launch
```bash
# Run both Backend and Web Dashboard
npm run dev
```

---

## 🏗️ Architecture
- **Backend**: Node.js, Express, Prisma (PostgreSQL), Puppeteer (PDFs).
- **Frontend**: React (Vite), TailwindCSS, Framer Motion, Lucide Icons.
- **Monorepo**: Managed via npm workspaces for shared logic and scalability.

---

## ✅ MVP Status
- [x] Phase 1: Foundation & RBAC
- [x] Phase 2: CBC Academic Engine
- [x] Phase 3: Timetable & Attendance
- [x] Phase 4: Automated Report Cards
- [x] Phase 5: Billing & Finance
- [x] Phase 6: Parent & Student Portals
- [x] Phase 7: Admin Bulk Tools
- [x] Phase 8: PWA & Offline Mode
- [x] Phase 9: UI Polish & Launch Readiness

**Built with ❤️ by Antigravity for Wehu CBC School.**
