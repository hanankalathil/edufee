<p align="center">
  <img src="https://img.shields.io/badge/Techora-EduFee-2563eb?style=for-the-badge&logoColor=white" alt="Techora EduFee" />
  <br/>
  <strong>Smart Education Fee & Institute Management Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/WhatsApp_API-25D366?style=flat-square&logo=whatsapp&logoColor=white" />
</p>

---

## 📖 About

**Techora EduFee** is a comprehensive, full-stack education management system built for coaching institutes, tuition centers, and small schools. It provides a modern, glassmorphism-styled dashboard to manage students, fees, attendance, timetables, and automated WhatsApp notifications — all from a single platform.

> Powered by [Techora](https://techora.in) — Smart Education Management Platform

---

## ✨ Features

### 👨‍🎓 Student Management
- Add, edit, and manage student profiles with detailed information
- Organize students into batches and groups
- View individual student profiles with fee and attendance history

### 💰 Fee Collection & Billing
- Record tuition charges, allocate discounts, and collect payments
- Support for multiple payment methods (Cash, UPI, Bank Transfer, etc.)
- Generate and download printable fee receipts
- Track pending and overdue fees at a glance

### 📅 Attendance Tracking
- Mark daily attendance per batch
- View attendance history and patterns
- Batch-wise attendance list management

### 🕐 Timetable Scheduling
- Create and manage weekly class timetables
- Visual timetable interface with drag-and-drop support

### 📊 Analytics & Reports
- Interactive dashboard with revenue charts (Chart.js)
- Total students, collections, pending fees, and overdue amount cards
- Monthly revenue visualization
- Exportable reports

### 💬 WhatsApp Integration
- **Built-in WhatsApp Gateway** powered by [Baileys](https://github.com/WhiskeySockets/Baileys)
- Send fee reminders directly to parents via WhatsApp
- QR code-based WhatsApp Web authentication
- Manage connection status from within the app
- Customizable reminder templates

### 🔔 Notifications & Reminders
- Automated fee reminder system
- In-app notification center
- Configurable reminder schedules

### ⚙️ Settings & Configuration
- Institute profile customization
- Admin profile management
- WhatsApp gateway settings
- App preferences

---

## 🛠️ Tech Stack

| Layer        | Technology                                                     |
| ------------ | -------------------------------------------------------------- |
| **Frontend** | HTML5, CSS3 (Glassmorphism UI), Vanilla JavaScript             |
| **Backend**  | Node.js, Express.js                                            |
| **WhatsApp** | Baileys (WhatsApp Web API), QRCode generation                  |
| **Charts**   | Chart.js                                                       |
| **Icons**    | Font Awesome 6                                                 |
| **Storage**  | LocalStorage (client-side data persistence)                    |

---

## 📁 Project Structure

```
edufees/
├── frontend/
│   ├── pages/
│   │   ├── login.html              # Authentication page
│   │   ├── dashboard.html          # Main dashboard with metrics & charts
│   │   ├── students.html           # Student listing
│   │   ├── add-student.html        # Add/edit student form
│   │   ├── student-profile.html    # Individual student details
│   │   ├── fees.html               # Fee collection & management
│   │   ├── fee-history.html        # Payment history log
│   │   ├── receipt-preview.html    # Printable fee receipt
│   │   ├── attendance.html         # Attendance overview
│   │   ├── mark-attendance.html    # Mark attendance (batch selector)
│   │   ├── mark-attendance-list.html # Mark attendance (student list)
│   │   ├── timetable.html          # Weekly timetable manager
│   │   ├── batches.html            # Batch management
│   │   ├── analytics.html          # Analytics & insights
│   │   ├── reports.html            # Report generation
│   │   ├── reminders.html          # Fee reminder management
│   │   ├── notifications.html      # Notification center
│   │   ├── settings.html           # App & institute settings
│   │   ├── profile.html            # Admin profile
│   │   └── whatsapp-settings.html  # WhatsApp gateway configuration
│   └── assets/
│       ├── css/                    # Stylesheets (common, dashboard, fees, etc.)
│       ├── js/                     # JavaScript modules (api, dashboard, fees, etc.)
│       ├── icons/                  # App icons
│       └── images/                 # Image assets
├── backend/
│   ├── server.js                   # Express + Baileys WhatsApp gateway server
│   └── package.json                # Backend dependencies
├── package.json                    # Root workspace configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hanankalathil/edufee.git
   cd edufee
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the WhatsApp Gateway server**
   ```bash
   npm start
   ```
   The backend server will start on `http://localhost:5000`

4. **Open the frontend**

   Simply open `frontend/pages/login.html` in your browser, or serve the `frontend/` directory using any static file server:
   ```bash
   npx serve frontend
   ```

5. **Connect WhatsApp**
   - Navigate to **Settings → WhatsApp Settings** in the app
   - Scan the QR code with your WhatsApp mobile app
   - Once connected, you can send fee reminders directly via WhatsApp

---

## 📸 Modules Overview

| Module               | Description                                           |
| -------------------- | ----------------------------------------------------- |
| **Dashboard**        | At-a-glance metrics, revenue chart, quick actions      |
| **Students**         | Full student CRUD with batch assignment                |
| **Fees**             | Payment collection, discount allocation, receipt gen   |
| **Attendance**       | Batch-wise daily attendance marking & history          |
| **Timetable**        | Weekly schedule builder                                |
| **Analytics**        | Visual insights into revenue & student data            |
| **Reports**          | Exportable fee and attendance reports                  |
| **WhatsApp**         | Integrated messaging gateway for parent communication  |
| **Notifications**    | Centralized notification & reminder hub                |
| **Settings**         | Institute, admin, and app configuration                |

---

## 🔐 Default Login

| Field      | Value               |
| ---------- | ------------------- |
| **Email**  | `admin@techora.in`  |
| **Password** | `admin123`       |

> ⚠️ Change default credentials after first login.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is developed and maintained by [Techora](https://techora.in).

---

<p align="center">
  Made with ❤️ by <a href="https://techora.in">Techora</a>
</p>
