# 🏭 Supply Management System

A sophisticated full-stack Supply Management System demonstrating modern enterprise architecture with polyglot persistence.

## 🌟 Features

### Core Functionality
- **Dashboard** - Real-time KPIs, low-stock alerts, order summaries, and data visualizations
- **Supplier Management** - Full CRUD operations for supplier data
- **Product Management** - Comprehensive product catalog management
- **Warehouse Management** - Multi-warehouse inventory tracking
- **Purchase Orders** - Create, approve, and track purchase orders
- **Shipment Tracking** - Real-time shipment monitoring with IoT data
- **Inventory Management** - Track stock levels across warehouses

### Security
- JWT Authentication with Refresh Tokens
- Role-Based Access Control (Admin, Manager, Staff, Viewer)
- Secure API endpoints with proper authorization

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite for lightning-fast development
- **Tailwind CSS** for modern, responsive styling
- **Inter Font** for clean typography
- **FontAwesome Icons** for professional iconography
- **Chart.js** for data visualizations
- **React Query** for server state management
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** and Helmet for security

### Databases (Polyglot Persistence)
- **Oracle** - Structured transactional data (suppliers, products, warehouses, inventory, POs)
- **MongoDB** - Event-driven data (shipment tracking, IoT sensors, audit logs)

## 📁 Project Structure

```
supply-management-system/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # React context providers
│   │   ├── services/         # API service functions
│   │   ├── utils/            # Utility functions
│   │   └── styles/           # Global styles
│   └── ...
├── backend/                  # Express API server
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility functions
│   └── ...
├── database/                 # Database schemas and scripts
│   ├── oracle/               # Oracle DDL and stored procedures
│   └── mongodb/              # MongoDB schemas
└── docs/                     # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Oracle Database (or Oracle XE)
- MongoDB 6+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd supply-management-system
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Configure Environment Variables**
   ```bash
   cd backend
   cp env.example .env
   # Edit backend/.env with your Oracle & Mongo credentials
   cd ..
   ```

5. **Run Database Migrations**
   ```bash
   npm run migrate
   ```

6. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

7. **Verify Database Connectivity**

## Inventory module – required env

Backend (`backend/.env`)
- `ORACLE_USER`, `ORACLE_PASSWORD`, `ORACLE_CONNECT_STRING` — Oracle pool credentials
- `MONGO_URI` — Mongo connection string
- `JWT_SECRET`, `REFRESH_SECRET` — auth tokens
- `CORS_ORIGIN` — typically `http://localhost:5173`

Run:
```bash
cd backend && npm run dev
cd frontend && npm run dev
```
   ```bash
   curl http://localhost:5000/health
   # or visit /api/dashboard to confirm Oracle + Mongo data flow
   ```

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, all CRUD operations |
| **Manager** | Approve POs, manage inventory, view reports |
| **Staff** | Create POs, update inventory, track shipments |
| **Viewer** | Read-only access to dashboards and reports |

## 📊 Database Design

### Oracle (Transactional Data)
- SUPPLIERS - Supplier information
- PRODUCTS - Product catalog
- WAREHOUSES - Warehouse locations
- INVENTORY - Stock levels per warehouse
- PURCHASE_ORDERS - Order headers
- PO_LINE_ITEMS - Order details
- INBOUND_SHIPMENTS - Shipment records

### MongoDB (Event Data)
- shipment_tracking - Real-time shipment events
- iot_sensor_readings - Temperature, humidity, GPS data
- audit_logs - User activity tracking
- delivery_status_logs - Delivery milestones

## 📜 License

MIT License - See LICENSE file for details
