# J12: Web-Based Order Management System (Manufacturing OMS)
*A Modern Enterprise Manufacturing Resource & Order Tracking Platform*  
**MCA 2nd Year Project**

---

## 1. Project Overview
The **Manufacturing Order Management System (OMS)** automates end-to-end industrial manufacturing workflows:
1. **Sales Order Management** — Multi-item orders, automated GST calculation (18%), status tracking.
2. **Bill of Materials (BOM) Generation** — Raw material formulations with scrap/wastage buffers and automated requirement calculations against sales orders.
3. **Purchase Order Tracking** — Procurement orders to industrial suppliers, tracking shipment and goods receipt into inventory.
4. **GST Invoice Generation** — Generation of tax invoices with CGST/SGST/IGST breakdown.
5. **Payment Management** — Multi-mode payment recording (NEFT, RTGS, UPI, Cheque) and balance due tracking.
6. **Role-Based Access Control (RBAC)** — Secure authentication with JWT, BCrypt encryption, and role-governed authorization (Admin, Order Manager, Procurement Officer).

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js 18
- **Build Tool**: Vite
- **Styling**: Bootstrap 5 + Bootstrap Icons
- **Routing**: React Router v6
- **HTTP Client**: Axios (with JWT interceptors)
- **Charts**: Chart.js / Recharts

### Backend
- **Platform**: Java 17 (OpenJDK)
- **Framework**: Spring Boot 3.x
- **Modules**: Spring Web, Spring Data JPA, Hibernate, Spring Security 6 (JWT)
- **Build Tool**: Apache Maven (Maven Wrapper mvnw)

### Database
- **Engine**: MySQL 8.0 (3NF Normalized, 15 tables)
- **Tools**: MySQL CLI / MySQL Workbench

---

## 3. Project Structure
`
OrderManagementSystem/
├── backend/                  # Spring Boot 3.x REST API Application
│   ├── src/main/java/        # Entities, Repositories, Services, Controllers, Security
│   ├── src/main/resources/   # application.properties
│   ├── src/test/             # Unit and Integration Tests
│   ├── mvnw.cmd              # Maven Wrapper for Windows
│   └── pom.xml               # Maven Dependencies
│
├── frontend/                 # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, Badges, Modals, StatCards
│   │   ├── pages/            # Dashboard, Orders, BOM, POs, Invoices, Payments, Users
│   │   ├── services/         # Axios API Services
│   │   ├── context/          # AuthContext (JWT session state)
│   │   └── routes/           # Protected Routes & App Routing
│   └── package.json          # Frontend Dependencies
│
├── database/                 # Database Scripts
│   ├── schema.sql            # 15 normalized 3NF tables with constraints
│   └── seed_data.sql         # Authentic Indian manufacturing sample data
│
├── docs/                     # Project Documentation
│   ├── requirements.md       # Functional & Non-Functional Specifications
│   ├── database-design.md    # 3NF Schema Documentation & Data Dictionary
│   ├── ER-diagram.md         # Mermaid Entity Relationship Diagram
│   ├── API-documentation.md  # REST API Endpoints & Postman Guide
│   └── test-report.md        # Test Cases and Verification Summary
│
└── README.md                 # Project Overview & Execution Guide
`

---

## 4. Default Demo Accounts

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **System Admin** | dmin | Admin@123 | Full access across all modules and user management |
| **Order Manager** | ordermanager | Order@123 | Customers, Sales Orders, BOM, Invoices, Payments |
| **Procurement Officer** | procurement | Procure@123 | Suppliers, Raw Materials, Purchase Orders |

---

## 5. Setup & Installation Guide

### Step 1: Database Setup
1. Open MySQL Workbench or terminal and connect to your MySQL 8 instance.
2. Execute database/schema.sql to create oms_db and all 15 tables.
3. Execute database/seed_data.sql to load realistic Indian manufacturing master and transaction data.

### Step 2: Backend Setup
1. Navigate to ackend/.
2. Configure src/main/resources/application.properties with your MySQL password.
3. Run:
   `ash
   ./mvnw spring-boot:run
   `
   The API server starts on http://localhost:8080.

### Step 3: Frontend Setup
1. Navigate to rontend/.
2. Install dependencies:
   `ash
   npm install
   `
3. Start development server:
   `ash
   npm run dev
   `
4. Open http://localhost:5173 in your browser and log in.
