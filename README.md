---

# 🎵 Sigma Audio — Dealer & Sales Intelligence Platform

**Enterprise-grade CRM and operational management system for automotive audio distribution**

---

## 📋 Table of Contents

- [Overview]
- [Key Features]
- [Tech Stack]
- [Project Architecture]
- [Getting Started]
- [Environment Variables]
- [User Roles & Permissions]
- [Core Modules]
- [Roadmap]
- [Contributing]


---

## 🔍 Overview

The **Sigma Audio Dealer & Sales Intelligence Platform** is a modern enterprise-grade CRM built specifically for automotive audio distribution businesses. It centralizes lead management, dealer operations, sales workflows, follow-up tracking, and analytics into a single cohesive ecosystem.

> Unlike traditional CRM systems, this platform focuses heavily on **workflow intelligence**, **dealer ecosystem management**, **operational automation**, and **executive-level analytics**.

---

## ✨ Key Features

### 🔐 Enterprise Authentication & Security
- JWT authentication with refresh token rotation
- Cookie-based secure session handling
- Role-based access control (RBAC)
- Protected APIs with full audit logging

### 📊 Lead Intelligence System
- Full lead lifecycle management with Kanban pipeline board
- Lead assignment, ownership, and status transitions
- Follow-up scheduling and overdue tracking
- CSV import/export, notes, attachments, and activity timeline

**Lead Statuses:** `New` → `Attempted Contact` → `Contacted` → `Interested` → `Negotiation` → `Dealer Assigned` → `Converted` / `Lost` / `Closed`

### 🏪 Dealer Management System
- Dealer onboarding and territory management
- Regional dealer tracking, rankings, and performance monitoring
- Product demand tracking and document management per dealer

### 📦 Product Intelligence
- Inquiry and demand analytics per product
- Regional product performance and dealer popularity metrics

**Supported Products:** `BCD202`, `BCD2401`, `BC202 PRO`

### 📈 Executive Analytics Dashboard
- Real-time KPIs: total leads, conversions, pending follow-ups
- Regional analytics, dealer performance, and employee productivity reports
- Activity feeds and operational insight panels

### ⚙️ Workflow Automation
- Automatic lead assignment triggers
- Follow-up reminders, escalation alerts, and inactivity tracking

### 🔔 Real-Time Notification System
- New inquiry, lead assignment, follow-up, and overdue task alerts

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework |
| Vite | 5.2 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| Zustand | 5.0 | Global state management |
| TanStack Query | 5.x | Server state & data fetching |
| TanStack Table | 8.x | Advanced table management |
| Recharts | 3.x | Charts and data visualization |
| Framer Motion | 12.x | Animations and transitions |
| React Router DOM | 6.x | Client-side routing |
| Axios | 1.6 | HTTP client |

### Backend

| Technology | Purpose |
|---|---|
| Python 3.13 + Django 5.0 | Core framework |
| Django REST Framework | RESTful API layer |
| djangorestframework-simplejwt | JWT authentication |
| django-cors-headers | CORS management |
| MySQLclient | MySQL ORM driver |

### Database
- **MySQL 8.x** — primary relational database
- **SQLite** — development/testing fallback

---

## 🗂 Project Architecture

```
CRM-Project/
├── backend/
│   ├── apps/
│   │   ├── accounts/          # User management & auth
│   │   ├── leads/             # Lead lifecycle & pipeline
│   │   ├── dealers/           # Dealer ecosystem management
│   │   ├── products/          # Product intelligence
│   │   ├── analytics/         # Executive dashboards & KPIs
│   │   ├── followups/         # Follow-up scheduling
│   │   ├── notifications/     # Real-time notifications
│   │   ├── audit/             # Audit logs & activity tracking
│   │   ├── tasks/             # Task management
│   │   ├── files/             # File & attachment handling
│   │   └── integrations/      # Third-party integration hooks
│   ├── shared/
│   │   ├── authentication/    # Cookie-based JWT auth
│   │   ├── permissions/       # RBAC & role definitions
│   │   ├── pagination/        # Page-number pagination
│   │   └── filters/           # Shared query filters
│   └── backend/               # Django project settings
│
└── frontend/
    └── src/
        ├── modules/
        │   ├── leads/         # Lead management UI
        │   ├── dealers/       # Dealer management UI
        │   ├── products/      # Product analytics UI
        │   ├── notifications/ # Notification center
        │   ├── audit/         # Audit log viewer
        │   ├── tasks/         # Task board
        │   └── settings/      # App settings
        ├── components/ui/     # Shared UI component library
        ├── layouts/           # App layout wrappers
        └── services/api/      # Axios API service layer
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- **Python** 3.11+
- **MySQL** 8.x
- **Git**

---

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/alanvarghesepaul22/CRM-Project.git
cd CRM-Project/backend

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your values

# 5. Create the MySQL database
# Run in your MySQL client:
# CREATE DATABASE sigma_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 6. Run migrations
python manage.py migrate

# 7. (Optional) Create a superuser
python manage.py createsuperuser

# 8. Start the dev server
python manage.py runserver
```

Backend API available at `http://localhost:8000`

---

### Frontend Setup

```bash
# From the project root
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend available at `http://localhost:5173`

---

## 🔧 Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
# Django
SIGMA_ENV=development
DJANGO_SECRET_KEY=your-secret-key-here     # python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_DEBUG=True

# MySQL Database
MYSQL_DATABASE=sigma_crm
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# JWT
JWT_ACCESS_LIFETIME_MINUTES=30
JWT_REFRESH_LIFETIME_DAYS=7

# File Storage
MEDIA_ROOT=media/
```

---

## 👥 User Roles & Permissions

| Role | Access Level |
|---|---|
| **Super Admin** | Full system access |
| **Admin** | All operational modules |
| **Sales Manager** | Leads, analytics, team oversight |
| **Dealer Manager** | Dealer ecosystem and assignments |
| **Sales Executive** | Assigned leads and follow-ups |
| **Support Staff** | Inquiry handling and notifications |

---

## 🔮 Roadmap

- [ ] AI-powered lead scoring
- [ ] Predictive sales analytics
- [ ] WhatsApp API integration
- [ ] Mobile application (iOS/Android)
- [ ] Automated reporting engine
- [ ] Conversational AI assistant
- [ ] Real-time analytics with WebSockets
- [ ] Advanced workflow automation builder

---

## 🤝 Contributing

Contributions are welcome! Please follow the standard GitHub flow:

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature description"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

Please ensure your code follows existing conventions and includes appropriate comments.

---


<div align="center">
Built for Sigma Audio · Powered by Django & React
</div>

---

