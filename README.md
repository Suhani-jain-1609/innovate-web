# StaffSync – Modern Human Resource Management System (MERN)

**StaffSync** is a modern, responsive, and secure web-based Human Resource Management System (HRMS) built with the **MERN Stack (MongoDB, Express.js, React.js, and Node.js)** and styled with **Tailwind CSS**.

StaffSync streamlines workforce operations through dedicated dashboards, workflows, and role-based permissions for three primary user personas: **HR Admin, Team Manager, and Employee**.

---

## 🌟 Key Role Capabilities

### 👑 1. HR Admin
- **Executive Operations Dashboard**: Total workforce headcount, active vs. inactive employees, employees on leave, pending time-off requests, and punctuality rate.
- **Attendance Monitor**: Real-time daily workforce roster, status categorization (On-Time, Late, Half-Day, Absent), filterable by date and department, plus manual attendance adjustments.
- **Employee Directory Management**:
  - Add, search, filter, edit, view employment cards, and activate/deactivate staff records.
  - Manage Employee IDs, titles, departments, joining dates, salaries, reporting managers, and emergency contacts.
- **Leave Operations Board**: Review and approve/reject leave requests company-wide with administrative notes and balance tracking.
- **Department Administration**: Create, organize, and monitor departments with assigned leadership and employee allocations.
- **Training & Skills Programs**: Schedule and manage company-wide or departmental workshops, view rosters, and track completion.
- **Corporate Bulletins**: Publish, edit, and pin company announcements with priority tags.
- **Analytics & Executive Reports**:
  - Attendance Audit Report (with Date/Department filters & CSV export).
  - Leave Utilization Report (with Status/Department filters & CSV export).
  - Employee Master & Payroll Report (with CSV export & Print view).

---

### 💼 2. Team Manager
- **Team Leadership Hub**: Scoped overview of direct reports, real-time team attendance today, pending team leave requests, and training sessions.
- **Direct Reports Roster**: View assigned team members, profiles, job designations, leave balances, and contact details.
- **Team Leave Approvals**: Review, approve, or reject time-off requests submitted strictly by direct reports with custom feedback notes.
- **Team Attendance Sheet**: Track daily check-in/out times, late arrivals, and absences for assigned team members.
- **Team Skill Development**: Create team-specific training workshops, enroll direct reports, and mark learning completion.
- **Team Announcements**: Publish targeted announcements and updates for their department.

---

### 💻 3. Employee
- **Personalized Workspace**: Warm time-aware greeting, live digital clock, and quick-action shortcuts.
- **Interactive Punch Clock**: One-click check-in and check-out with automatic on-time vs. late detection and daily duration calculation.
- **Accrued Leave Balances**: Real-time visual progress bars for Casual, Sick, and Annual vacation allowances.
- **Leave Application & Tracking**: Select leave category, pick dates with automatic day calculation, provide reason, and track approval status with supervisor feedback.
- **Training Catalog**: Explore upcoming development workshops, enroll in sessions, and mark progress as completed.
- **Company Bulletins**: Read organizational news, policy updates, and pinned broadcasts.
- **Account & Profile Management**: Update phone, residential address, emergency contact, and securely change password.

---

## ⚡ Quick Demo Accounts

On the login page (`http://localhost:3000/login`), use the **1-Click Quick Demo Switcher** or log in manually:

| Role | Email | Password | Representative |
| :--- | :--- | :--- | :--- |
| **HR Admin** | `admin@staffsync.com` | `Password123!` | Sarah Jenkins (Chief People Officer) |
| **Team Manager** | `alex.manager@staffsync.com` | `Password123!` | Alex Rivera (Engineering Lead) |
| **Team Manager** | `elena.manager@staffsync.com` | `Password123!` | Elena Rostova (VP of Marketing) |
| **Employee** | `marcus@staffsync.com` | `Password123!` | Marcus Vance (Full Stack Engineer) |
| **Employee** | `priya@staffsync.com` | `Password123!` | Priya Sharma (UI/UX Developer) |

---

## 🏗️ Technology Stack

- **Frontend**:
  - React 19
  - Vite 8
  - Tailwind CSS v4
  - Lucide React Icons
  - React Router DOM v6
  - Axios (with JWT interceptors)
- **Backend**:
  - Node.js & Express.js
  - MongoDB & Mongoose
  - JSON Web Tokens (`jsonwebtoken`)
  - Password Encryption (`bcryptjs`)
  - CORS, Morgan logger, Dotenv
- **Database**:
  - Local MongoDB instance (`mongodb://127.0.0.1:27017/staffsync_db`)

---

## 🚀 Running the Project

### 1. Database Seeding
To populate the database with realistic sample employees, attendance history, leave applications, and training programs:
```bash
npm run seed
```

### 2. Start Both Backend & Frontend
```bash
npm run dev
```

### 3. Individual Services (Optional)
- **Backend API**: `npm run server` (runs on `http://localhost:5000`)
- **Frontend App**: `npm run client` (runs on `http://localhost:3000`)

