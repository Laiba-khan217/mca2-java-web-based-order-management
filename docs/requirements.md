# Functional & Non-Functional Requirements Specification (SRS)
## J12 – Web-Based Order Management System (Manufacturing OMS)

### 1. Functional Requirements

#### 1.1 Role-Based Access Control (RBAC) & Security
- **FR-01**: The system shall support three distinct user roles: ROLE_ADMIN, ROLE_ORDER_MANAGER, and ROLE_PROCUREMENT_OFFICER.
- **FR-02**: Passwords shall be encrypted using BCrypt with a minimum cost factor of 10.
- **FR-03**: Secure REST API authentication using JSON Web Tokens (JWT) with bearer authorization headers.
- **FR-04**: React route guards shall prevent unauthorized access based on user role permissions.

#### 1.2 Sales Order Management
- **FR-05**: Order Managers shall create, view, update, search, filter, and cancel sales orders.
- **FR-06**: Each sales order can contain multiple manufactured product line items with quantities and unit prices.
- **FR-07**: System shall automatically calculate line totals, 18% GST tax amount, optional discounts, and grand totals in INR.
- **FR-08**: Order lifecycle states: PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED (or CANCELLED).

#### 1.3 Bill of Materials (BOM) & Inventory
- **FR-09**: Engineers/Managers shall define multi-level raw material recipes (BOM) for each product.
- **FR-10**: System shall calculate required raw material quantities for any sales order, accounting for scrap/wastage percentages:
  $\text{TotalRequired} = \sum (\text{OrderQuantity} \times \text{ItemUnitRequirement} \times (1 + \text{ScrapPercentage}/100))$.
- **FR-11**: System shall identify raw material shortfalls against existing stock levels.

#### 1.4 Purchase Order Tracking
- **FR-12**: Procurement Officers shall maintain supplier records with GSTIN, PAN, and contact details.
- **FR-13**: Procurement Officers shall generate Purchase Orders (PO) against suppliers for raw materials.
- **FR-14**: PO lifecycle states: DRAFT -> ISSUED -> CONFIRMED -> SHIPPED -> RECEIVED -> CANCELLED.
- **FR-15**: Marking PO items as received shall automatically increase raw material inventory stock.

#### 1.5 Invoicing & Taxation
- **FR-16**: System shall generate official tax invoices from confirmed sales orders with sequential numbers (INV-2026-XXXX).
- **FR-17**: Invoices shall compute GST: Intrastate (9% CGST + 9% SGST) or Interstate (18% IGST).
- **FR-18**: Invoices maintain status: ISSUED, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED.

#### 1.6 Payment Management
- **FR-19**: System shall record payments against invoices with mode (NEFT, RTGS, UPI, CHEQUE, BANK_TRANSFER) and transaction reference.
- **FR-20**: Payments shall automatically reduce invoice balance due and update status to PAID once balance reaches ₹0.00.

---

### 2. Non-Functional Requirements
- **Performance**: API responses for CRUD and calculation operations within 200ms.
- **Integrity**: Referential integrity enforced at the MySQL engine level with foreign keys and check constraints.
- **Security**: No plaintext passwords in database; stateless JWT tokens with 24-hour expiration.
- **Responsiveness**: Fully responsive Bootstrap 5 UI optimized for desktop, tablet, and mobile browsers.
