# Project Presentation (PPT) Structure & Viva Defense Guide
## J12 – Web-Based Order Management System for Manufacturing Organization

Use the following slide-by-slide structure for your college viva presentation:

---

### Slide 1: Title Slide
- **Project Title:** Web-Based Order Management System (Manufacturing OMS)
- **Course:** Master of Computer Applications (MCA) – Final Year Project
- **Student Name:** [Your Name]
- **Roll / PRN Number:** [Your Roll Number]
- **Project Guide:** [Guide's Name]
- **Institution:** [College Name]

### Slide 2: Problem Statement & Motivation
- **Manual Inefficiencies:** Traditional manufacturing SMEs rely on fragmented spreadsheets, leading to inventory stockouts, inaccurate tax calculations, and disconnected procurement.
- **Industry 4.0 Need:** Modern manufacturers require a unified, cloud-ready digital platform bridging sales orders directly to shop-floor BOM requirements and vendor replenishment.

### Slide 3: Project Objectives
1. Implement complete Sales Order lifecycle tracking with automated Indian GST calculation.
2. Develop an automated Bill of Materials (BOM) Explosion Engine with scrap buffers.
3. Automate vendor Purchase Order tracking and real-time inventory replenishment upon Goods Receipt.
4. Provide GST-compliant Tax Invoicing, Payment Reconciliation, and Executive Analytics.
5. Enforce strict Role-Based Access Control (Admin, Order Manager, Procurement Officer).

### Slide 4: System Architecture
- Multi-tier Client-Server architecture:
  - **Frontend:** React 18, Vite, Bootstrap 5, Axios, React Router.
  - **Backend:** Java 17, Spring Boot 3.3.5, Spring Security 6, Spring Data JPA.
  - **Database:** MySQL 8.0 (15 Normalized 3NF tables).
  - **Communication:** Stateless RESTful APIs with JWT Bearer Token headers.

### Slide 5: Entity Relationship (ER) & Database Design
- 15 relational tables grouped into 3 functional modules:
  - **Master Data:** `roles`, `users`, `user_roles`, `customers`, `suppliers`, `products`, `raw_materials`.
  - **Manufacturing Operations:** `sales_orders`, `sales_order_items`, `bills_of_materials`, `bom_items`, `purchase_orders`, `purchase_order_items`.
  - **Financial Settlement:** `invoices`, `invoice_items`, `payments`.

### Slide 6: Key Engineering Innovations
1. **Automated BOM Explosion Algorithm:** Instant computation of gross raw material requirements including engineering scrap percentage buffers.
2. **Real-time Stock Shortfall Detection:** Compares order demand against warehouse stock and alerts procurement.
3. **Goods Receipt (GRN) Automated Inventory Update:** Automatically updates `current_stock` in MySQL upon gate receipt.
4. **GST Tax Invoice Generator:** Differentiates CGST + SGST (9%+9%) vs IGST (18%) and provides a printable Indian GST tax invoice.

### Slide 7: Security & Role-Based Access Control (RBAC)
- Spring Security 6 stateless filter chain.
- BCrypt cryptographic password hashing (10 rounds).
- Granular endpoint security (`hasRole('ADMIN')`, `hasAnyRole(...)`).
- Route guards on frontend protecting pages by authenticated user role.

### Slide 8: Live Demonstration Walkthrough
- Step 1: Login as Order Manager (`ordermanager`).
- Step 2: Create a Sales Order for Industrial Centrifugal Pumps & Induction Motors.
- Step 3: Run BOM Explosion & examine material shortfalls.
- Step 4: Login as Procurement Officer (`procurement`) & issue a Purchase Order for shortfalls.
- Step 5: Receive goods and show `raw_materials.current_stock` updated in real time.
- Step 6: Generate GST Tax Invoice, view printable invoice, and record NEFT payment.
- Step 7: View Executive Dashboard analytics, charts, and metrics.

### Slide 9: Testing & Quality Assurance
- Automated Unit & Service Tests with JUnit 5.
- Integration tests with `@SpringBootTest` and MySQL integration.
- Maven Surefire: **3/3 Tests Passed (0 errors, 0 failures)**.
- Frontend bundle compiled with 0 errors via Vite.

### Slide 10: Conclusion & Future Scope
- **Conclusion:** Successfully delivered an end-to-end, enterprise-grade Manufacturing Order Management System fulfilling all academic MCA curriculum requirements.
- **Future Scope:**
  - Barcode / QR-code scanning for warehouse receiving.
  - Integration with Razorpay / Cashfree payment gateway webhooks.
  - IoT telemetry from shop-floor CNC machines for automated scrap logging.
