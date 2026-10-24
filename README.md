# 🚀 TaskFlow — Enterprise Agile Workspace & Jira Clone

[![Node.js Version](https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express.js](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.1-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Material UI](https://img.shields.io/badge/MUI-v9-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, full-stack, enterprise-grade Agile project management and issue-tracking platform built with **React 19**, **Node.js (Express 5)**, **PostgreSQL 17 (Prisma ORM v7)**, **Redis**, and **Socket.IO**. Featuring real-time Kanban boards, multi-tenancy, time-tracking with immutable financial rate snapshotting, interactive Swagger API documentation, and bilingual support (English LTR & Persian RTL).

---

## ⚡ Instant Demo Access (No Signup or SMS Required)

To allow recruiters, reviewers, and developers to explore the application immediately without configuring an SMS provider or waiting for verification codes, pre-configured **Mock Users** and a **Complete Demo Workspace** are automatically seeded into the database.

### 🔑 Demo Credentials

| Role | Username / Phone | Password | Access Level | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Workspace Admin** *(Recommended)* | `09121111111` | `Password123!` | Full Admin / Owner | Company Owner, Project Manager, Full system permissions |
| **Lead Engineer** | `09122222222` | `Password123!` | Team Lead / Member | Engineering Lead, task assignments, board updates |
| **Fullstack Dev** | `09152498291` | `Password123!` | Developer | Project Developer, task comments, time logging |

> **Tip:** You can also click the **"🚀 1-Click Demo Login"** button located directly on the Login page (`/login`) to sign in instantly with one click!

### 📦 Pre-seeded Demo Data Includes:
- **Company**: *Acme Corporation* (`acme-corp`)
- **Team**: *Core Platform Engineering*
- **Project**: *Apollo Cloud Platform* (with a billable rate of **$65.00/hr**)
- **Active Sprint**: *Sprint 1 — Foundation & Core API*
- **Kanban Tasks**: Pre-populated across all 4 stages (**TODO**, **IN_PROGRESS**, **REVIEW**, **DONE**) with priorities, story points, and assignees
- **Activity & Financials**: Sample task comments, audit logs, notifications, and billable time logs with historical earnings calculation

---

## 🌟 Key Features

### 📋 Agile Project & Task Management
- **Interactive Kanban Boards**: Real-time task board divided into `TODO`, `IN_PROGRESS`, `REVIEW`, and `DONE`.
- **Sprint Lifecycles**: Organize issues into Sprints with defined goals, start/end dates, and status transitions (`PLANNED`, `ACTIVE`, `COMPLETED`).
- **Rich Task Metadata**: Priority flags (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), story points, time estimates, tags/labels, and file attachments.
- **Activity Audit Trail**: Chronological task history capturing every status shift, assignee change, and description update.
- **Threaded Comments**: Real-time discussion threads on individual tasks.

### ⏱️ Time Tracking & Billable Earnings Engine
- **Accurate Duration Logging**: Log time spent on tasks down to the minute.
- **Immutable Financial Snapshots**: When time is logged, the project's current hourly rate (`hourlyRateCents`) is snapshotted (`rateSnapshotCents`). Historical earnings remain accurate even if project rates change in the future.
- **Financial Analytics**: Automated earnings computation `(duration / 60) * rateSnapshotCents` with multi-currency support (e.g. USD, EUR).

### 🏢 Multi-Tenant Workspace & Role-Based Access Control (RBAC)
- **Hierarchical Structure**: `Company` ➔ `Team` ➔ `Project` ➔ `Task`.
- **Granular Roles**:
  - **Company Level**: `OWNER`, `ADMIN`, `MEMBER`
  - **Team Level**: `LEAD`, `MEMBER`
  - **Project Level**: `MANAGER`, `DEVELOPER`, `VIEWER`

### ⚡ Real-Time Collaboration (Socket.IO & Redis)
- **Live Board Synchronization**: Instantly updates task states across all connected team members without manual refreshes.
- **In-App Notifications**: Real-time alert badges for task assignments, mentions, status updates, and deadline reminders.
- **Redis Cache & Pub/Sub**: High-performance session storage, query caching, and scalable socket room broadcasting.

### 🌐 Bilingual (English & Persian) with Dynamic RTL/LTR
- **Seamless Language Switching**: Instant toggle between English and Persian (فارسی).
- **Directional Styling**: Dynamic LTR and RTL rendering using `stylis-plugin-rtl` with typography adjustments.
- **Persian Digit Normalization**: Transparent conversion of Persian/Arabic digits (`۱۲۳`) to standard numeric formats on input validation.

### 📖 Interactive Swagger API Documentation
- Fully documented OpenAPI / Swagger specifications available out-of-the-box at `/docs` and `/api-docs`.
- Integrated endpoint search and interactive "Try it out" API playground.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    Client["React 19 Frontend<br/>(Vite, MUI v9, RTK Query)"]
    Proxy["Vite Dev / Preview Proxy<br/>(:3000 / :5173)"]
    API["Express 5 REST API<br/>(:5000 / :8000)"]
    Socket["Socket.IO Server<br/>(Realtime Events)"]
    Redis[("Redis 7<br/>Cache & Pub/Sub")]
    Postgres[("PostgreSQL 17<br/>Prisma ORM v7")]

    Client -->|HTTP Requests| Proxy
    Client -.->|WebSocket Connection| Socket
    Proxy -->|Reverse Proxy /api| API
    Socket <--> API
    API <--> Redis
    API <--> Postgres
```

---

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run the entire stack (PostgreSQL, Redis, Backend API, and Frontend Client) is via Docker Compose:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/jiraP.git
cd jiraP
```

### 2. Copy the environment file
```bash
# On Linux/macOS
cp .env.example .env

# On Windows (PowerShell)
Copy-Item .env.example .env
```

### 3. Build and launch containers
```bash
docker compose up --build
```

### 4. Open in your browser
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Documentation (Swagger)**: [http://localhost:5000/docs](http://localhost:5000/docs)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

*(The database schema and initial mock data will be automatically applied on container startup).*

---

## 💻 Manual Local Development Setup

If you prefer running services directly on your host machine:

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended, v22+ tested)
- [PostgreSQL](https://www.postgresql.org/) (v15+)
- [Redis](https://redis.io/) (v6+)

---

### Step 1: Configure Backend API

```bash
cd api

# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env

# 3. Edit .env with your local PostgreSQL and Redis credentials:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/jira_db"
# REDIS_URL="redis://localhost:6379"
# JWT_SECRET="your_custom_jwt_secret"

# 4. Push Prisma schema to your database & generate client
npm run prisma:push
npm run prisma:generate

# 5. Seed initial mock users and demo data
npm run seed

# 6. Start the API server in development mode
npm run dev
```
The API server will start at `http://localhost:8000`.

---

### Step 2: Configure Frontend Client

Open a new terminal window:

```bash
cd client

# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env

# 3. Start Vite development server
npm run dev
```
The frontend will open at `http://localhost:5173`.

---

## ⚙️ Environment Variables Reference

### Backend (`api/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `8000` | HTTP port on which the Express server listens |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `DATABASE_URL` | `postgresql://app_user:app_PASSWORD@localhost:5432/app_db` | PostgreSQL connection string for Prisma ORM |
| `REDIS_URL` | `redis://localhost:6379` | Full Redis connection URI |
| `REDIS_HOST` | `localhost` | Redis host (alternative to `REDIS_URL`) |
| `REDIS_PORT` | `6379` | Redis port |
| `JWT_SECRET` | *(string)* | Secret key used for signing authentication JWT tokens |
| `JWT_EXPIRES_IN` | `24h` | Token expiration lifespan |
| `SMS_KEY` | *(optional)* | SMS provider API key (for production phone verification) |

### Frontend (`client/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `/api` | Base path or URL for backend REST API endpoints |
| `VITE_BACKEND_URL` | `http://localhost:8000` | Backend target URL for Vite reverse proxy |
| `VITE_SOCKET_URL` | `http://localhost:8000` | WebSocket / Socket.IO server connection endpoint |

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/login` | Authenticate user with phone & password | ❌ |
| `POST` | `/api/auth/register` | Register new account with SMS verification | ❌ |
| `POST` | `/api/auth/forget-pass` | Reset password using SMS code | ❌ |
| `GET` | `/api/users/profile` | Retrieve current authenticated user profile | ✅ |
| `GET` | `/api/companies` | List companies user belongs to | ✅ |
| `POST` | `/api/companies` | Create a new company workspace | ✅ |
| `GET` | `/api/teams` | List teams in workspace | ✅ |
| `GET` | `/api/projects` | List projects with member access & hourly rates | ✅ |
| `POST` | `/api/projects` | Create a new project | ✅ |
| `GET` | `/api/tasks` | Get tasks with filters (search, project, priority, status) | ✅ |
| `POST` | `/api/tasks` | Create a new task in a project | ✅ |
| `PATCH` | `/api/tasks/:id` | Update task details, status, or assignee | ✅ |
| `GET` | `/api/tasks/:id/history` | Retrieve full chronological audit history | ✅ |
| `POST` | `/api/tasks/:id/comments` | Add comment to a task | ✅ |
| `GET` | `/api/time-entries` | Query logged time entries & calculated earnings | ✅ |
| `POST` | `/api/time-entries` | Log time entry with automatic rate snapshot | ✅ |
| `GET` | `/api/notifications` | List user notifications | ✅ |
| `GET` | `/health` | Service health status and Redis connection check | ❌ |
| `GET` | `/docs` | Interactive Swagger API Documentation UI | ❌ |

---

## 📂 Project Structure

```text
jiraP/
├── .env.example              # Docker Compose environment variables template
├── .gitignore                # Global Git ignore rules
├── docker-compose.yml        # Multi-container orchestration (PostgreSQL, Redis, API, Client)
├── README.md                 # Project documentation
│
├── api/                      # Backend REST API (Node.js & Express 5)
│   ├── .env.example          # Backend environment variables template
│   ├── Dockerfile            # Multi-stage production container for API
│   ├── docker-entrypoint.sh  # Auto-migration & seeding entrypoint script
│   ├── seed.js               # Database seeding script (mock users & demo workspace)
│   ├── server.js             # HTTP and Socket.IO server initialization
│   ├── app.js                # Express app setup, routing, and error handling
│   ├── config/               # Prisma, Redis, and i18n configurations
│   ├── Modules/              # Modular domain architecture
│   │   ├── Auth/             # Authentication & token verification
│   │   ├── Company/          # Company workspace & role management
│   │   ├── Team/             # Team structures & member relations
│   │   ├── Projects/         # Projects, deadlines & hourly rates
│   │   ├── Task/             # Kanban tasks, statuses & priorities
│   │   ├── TaskHistory/      # Activity logs & audit trail
│   │   ├── TaskComment/      # Task commenting system
│   │   ├── TimeTracking/     # Time entries & earnings snapshot engine
│   │   └── Notification/     # Notification handlers & alerts
│   ├── socket/               # Socket.IO room events & dispatchers
│   └── prisma/
│       ├── schema.prisma     # Database models and relations
│       └── migrations/       # Schema migrations history
│
├── client/                   # Frontend SPA (React 19, Vite, Material UI v9)
│   ├── .env.example          # Frontend environment variables template
│   ├── Dockerfile            # Multi-stage production container for Vite preview
│   ├── vite.config.js        # Vite configuration with proxy rules
│   ├── src/
│   │   ├── App.jsx           # Main application component
│   │   ├── layouts/          # AuthLayout, DashboardLayout, Sidebar, Navbar
│   │   ├── pages/
│   │   │   ├── auth/         # Login (with 1-Click Demo), Register, Reset Password
│   │   │   ├── landing/      # Product landing page & feature tour
│   │   │   ├── dashboard/    # Workspace overview & statistics
│   │   │   ├── tasks/        # Interactive Kanban board & task dialogs
│   │   │   ├── projects/     # Project management & member rates
│   │   │   ├── company/      # Workspace company settings
│   │   │   └── notifications/# Notifications center
│   │   ├── Store/            # Redux Toolkit store & RTK Query API slices
│   │   ├── locales/          # English (en.json) & Persian (fa.json) translations
│   │   └── utils/            # Socket client, formatters, RTL helpers
│
└── scripts/                  # E2E integration test scripts
    ├── seed-users.js         # Quick seed trigger
    ├── test-company-e2e.js   # Company endpoints test suite
    ├── test-earnings-e2e.js  # Earnings & snapshot calculations test suite
    └── test-i18n-e2e.js      # Internationalization test suite
```

---

## 🛠️ Useful Commands

| Task | Command |
| :--- | :--- |
| **Run All Services via Docker** | `docker compose up --build` |
| **Stop All Services** | `docker compose down` |
| **Reset Database Data** | `docker compose down -v` |
| **Seed Database Manually** | `cd api && npm run seed` |
| **Inspect DB via Prisma Studio** | `cd api && npm run studio` |
| **Push Prisma Schema Changes** | `cd api && npm run prisma:push` |
| **Build Frontend for Production** | `cd client && npm run build` |
| **Preview Production Frontend** | `cd client && npm run preview` |
| **Run E2E Company Tests** | `node scripts/test-company-e2e.js` |
| **Run E2E Earnings Tests** | `node scripts/test-earnings-e2e.js` |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this software for personal or commercial projects.

---

## 👨‍💻 Author

Developed with care by **Yousef**. Contributions, issues, and feature requests are welcome!
Feel free to star ⭐ the repository if you found it useful.
