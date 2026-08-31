# 🏢 Facility Asset Management System

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A comprehensive, full-stack enterprise solution designed for IT departments and Facility Managers to track hardware assets, manage seat assignments, and handle employee support tickets efficiently.

## ✨ Key Features

- **🔐 Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Super Admins, Sub-Admins, HODs (Head of Departments), and Employees.
- **💻 Asset Tracking & Seat Mapping:** Assign IT assets (Monitors, CPUs, Mice, Keyboards) directly to employees or specific seats/floors.
- **🔄 Advanced Swap & Audit History:** Fully tracked lifecycle of an asset. Know exactly when an item was assigned, repaired, returned to the store, or retired, along with who authorized the change.
- **🎫 IT Ticketing System:** Employees can raise tickets for broken assets. IT staff can track, update, and resolve tickets with detailed resolution notes.
- **📊 Real-time Dashboards:** Overview of total assets, available inventory, pending tickets, and maintenance stats.
- **🎨 Modern UI/UX:** Built with Next.js App Router, Tailwind CSS, and Shadcn UI for a fast, responsive, and beautiful user experience.

## 🛠️ Tech Stack

**Frontend:**
- [Next.js (App Router)](https://nextjs.org/) - React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn UI](https://ui.shadcn.com/) - UI Components
- [React Query](https://tanstack.com/query/latest) - Data Fetching & State Management

**Backend:**
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma ORM](https://www.prisma.io/) - Database ORM
- PostgreSQL / SQLite - Database

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone the repository
\\\ash
git clone https://github.com/Ravi5612/facility-asset-management.git
cd facility-asset-management
\\\

### 2. Start the Backend
\\\ash
cd backend
npm install
# Setup your .env variables here (Database URL, JWT Secret)
npx prisma db push
npm run start:dev
\\\
*The backend will run on http://localhost:3001*

### 3. Start the Frontend
\\\ash
cd ../frontend
npm install
# Setup your .env variables here (NEXT_PUBLIC_API_URL)
npm run dev
\\\
*The frontend will run on http://localhost:3000*

## 📸 Screenshots

*(You can add screenshots of your dashboards and modals here by dragging and dropping images into this README file on GitHub)*

---
## 📞 Contact

Developed by **Ravi Rai**
- 📧 Email: [ravirai84272@gmail.com](mailto:ravirai84272@gmail.com)
- 📱 Phone: +91-XXXXXXXXXX (Update this in README.md)
- 🌐 GitHub: [@Ravi5612](https://github.com/Ravi5612)

