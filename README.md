# Employee Leave & Payroll System

<p align="center">
  <img src="https://img.shields.io/badge/MERN_Stack-534AB7?style=for-the-badge" />
  <img src="https://img.shields.io/badge/JWT_Auth-185FA5?style=for-the-badge" />
  <img src="https://img.shields.io/badge/ISC_License-0F6E56?style=for-the-badge" />
  <img src="https://img.shields.io/badge/v1.0-Amber?style=for-the-badge" />
</p>

**A full-stack enterprise workforce management platform that eliminates manual HR processes — attendance, leave tracking, and payroll automation in one centralized application.**

---

### 📊 System Overview

| Tech Layers | API Endpoints | User Roles | Roadmap Items |
| :---: | :---: | :---: | :---: |
| **5** | **10+** | **2** | **5** |

---

### ✨ Core Features

#### 🛡️ Administrative Suite
*   **Employee Lifecycle**: Comprehensive CRUD management for staff records and salary structures.
*   **Leave Governance**: Streamlined approval workflow with automated balance auditing.
*   **Payroll Engine**: Automated monthly calculation with tax, PF, and deduction logic.
*   **Reporting Hub**: Real time analytics and data visualization via interactive dashboards.
*   **Digital Delivery**: Automated PDF payslip generation and email distribution.

#### 👤 Employee Portal
*   **Workforce Profile**: Personalized dashboard for attendance monitoring and leave status.
*   **Self-Service Requests**: Seamless application for multiple leave types (Sick, Casual, Paid).
*   **Transparency Sync**: Real-time tracking of request approvals and HR communications.
*   **Document Access**: Secure vault for downloading and viewing historical payslips.

---

### 🛠️ Technology Ecosystem

| Component | Stack |
| :--- | :--- |
| **Frontend** | React.js, Vite, Framer Motion, Recharts, Vanilla CSS |
| **Backend** | Node.js, Express.js, Passport.js, PDFKit, Nodemailer |
| **Persistence** | MongoDB Atlas, Mongoose ODM |
| **Security** | JWT, Google OAuth 2.0, RBAC |

---

### 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/google` | Social Authentication |
| `GET` | `/api/employees` | Fetch Staff Directory |
| `POST` | `/api/employees` | Onboard New Employee |
| `PUT` | `/api/leaves/:id` | Action Leave Request |
| `POST` | `/api/payroll/process` | Generate Monthly Salaries |
| `GET` | `/api/payroll/payslip/:id` | Download PDF Document |

---

### 🚀 Quick Start & Deployment

#### 1️⃣ Environment Setup
Ensure you have the following keys in your `.env` files:
```env
MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SMTP_USER, SMTP_PASS
```

#### 2️⃣ Installation
```bash
# Clone the repository
git clone https://github.com/Harsh-2006-git/Employee-Payrole-and-leave-Management-System.git

# Initialize Backend
cd Backend && npm install
npm run dev

# Initialize Frontend
cd Frontend && npm install
npm run dev
```

---

### 🗺️ Future Roadmap
- [ ] **Biometric Integration**: Facial recognition for attendance.
- [ ] **Mobile Ecosystem**: Native Android & iOS application.
- [ ] **AI Predictions**: Salary and budget forecasting.
- [ ] **Organization Scale**: Support for multiple organizations.

---

### 🤝 Contact & Support
**Harsh Manmode**  
📧 [harshmanmode79@gmail.com](mailto:harshmanmode79@gmail.com)  
🔗 [GitHub Profile](https://github.com/Harsh-2006-git)

---

<p align="center">
  Licensed under <b>ISC</b> &nbsp;·&nbsp; Built with Precision &nbsp;·&nbsp; 2026
</p>
