# STEMPath 🌍

Empowering the next generation of African women in STEM through mentorship, education, and community.

A full-stack STEM mentorship and learning platform with a React frontend and Node.js + Express + PostgreSQL backend.

---

## 🚀 Quick Start

### Option A — Docker (recommended, one command)

```bash
docker compose up --build
```

Then open:

* Frontend: [http://localhost:5173](http://localhost:5173)
* API:      [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Option B — Manual Setup

#### 1. PostgreSQL

Create a database named `stempath`:

```sql
CREATE DATABASE stempath;
```

#### 2. Backend

```bash
cd backend
npm install
npm run db:init
npm run dev
```

#### 3. Frontend

```bash
npm install
npm run dev
```

---

## 🔑 Demo Accounts

All demo passwords: `password123`

| Role    | Email                                           | Dashboard  |
| ------- | ----------------------------------------------- | ---------- |
| Admin   | [admin@stempath.io](mailto:admin@stempath.io)   | `/admin`   |
| Mentor  | [amara@stempath.io](mailto:amara@stempath.io)   | `/mentor`  |
| Mentor  | [fatima@stempath.io](mailto:fatima@stempath.io) | `/mentor`  |
| Student | [amina@gmail.com](mailto:amina@gmail.com)       | `/student` |
| Student | [grace@gmail.com](mailto:grace@gmail.com)       | `/student` |

---

## 📁 Project Structure

```
STEMPATH/
│
├── backend/                     # Backend server (Node.js + Express API)
│   ├── src/                     # Main backend source code
│   │   ├── controllers/         # Handle requests & responses (business logic)
│   │   ├── database/            # Database initialization logic
│   │   ├── db/                  # Database helpers (queries wrapper)
│   │   ├── middleware/          # Auth, roles, and validation middleware
│   │   ├── repositories/        # All database operations (data access layer)
│   │   ├── routes/              # API routes definitions
│   │   ├── utils/               # Helper functions (JWT, hashing, uploads)
│   │   └── app.js               # Express app configuration
│   │
│   ├── uploads/                 # Stores uploaded files (CVs, images, etc.)
│   ├── .env                     # Environment variables (secrets, configs)
│   ├── Dockerfile               # Backend Docker setup
│   ├── server.js                # Backend entry point
│   ├── package.json             # Backend dependencies
│   └── package-lock.json        # Backend dependency lock file
│
├── database/                    # Database layer (PostgreSQL)
│   ├── migrations/              # Database migrations (future changes)
│   ├── schema.sql               # Database schema definition
│   └── seedData.sql             # Sample/demo data
│
├── frontend/                    # Frontend application (React)
│   ├── src/                     # Main frontend source code
│   │   ├── assets/              # Images, icons, static assets
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # Global state management (Auth, App state)
│   │   ├── pages/               # Application pages (dashboards, landing)
│   │   ├── services/            # API communication layer
│   │   ├── App.jsx              # Main React component (routing)
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   │
│   ├── public/                  # Static public files
│   ├── index.html               # HTML template
│   ├── Dockerfile.frontend      # Frontend Docker setup
│   ├── docker-compose.yml       # Multi-container setup (frontend + backend + DB)
│   ├── package.json             # Frontend dependencies
│   ├── package-lock.json        # Frontend lock file
│   └── README.md                # Frontend documentation
```

---

## 🔌 API Overview

All endpoints are prefixed with `/api`.

### Key Features:

* Authentication & user management
* Mentorship system (requests, approvals)
* Courses and learning progress
* Chat system between users
* Community forum
* Notifications system
* Admin dashboard & analytics

---

## 🗄️ Database Overview

Core structure:

```
users → students / mentors
mentorship_requests → mentorships
categories → courses → lessons
progress → certificates
messages → notifications
forum_posts → forum_replies
```

---

## 🎨 Design System

* Clean modern UI
* Accessible color palette
* Responsive design for all devices

---

## 🔐 Security

* JWT Authentication
* Password hashing (bcrypt)
* Role-based authorization
* Input validation
* Secure file uploads

---

## ❤️ Mission

STEMPath is built to empower girls and women in Africa by providing access to STEM education, mentorship, and opportunities to grow and succeed in technology fields.

---

Built with ❤️ for African women in STEM.
