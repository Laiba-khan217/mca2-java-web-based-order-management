# REST API Documentation
## J12 – Web-Based Order Management System (Manufacturing OMS)
**Base URL**: http://localhost:8080/api/v1

### 1. Authentication (/auth)
- POST /auth/login — Authenticate username & password; returns JWT token and user profile.
- GET /auth/me — Returns currently authenticated user details.

### 2. User Management (/users) [Admin Only]
- GET /users — List all registered users.
- POST /users — Create a new user with assigned roles.
- PUT /users/{id} — Update user profile and roles.
- DELETE /users/{id} — Deactivate user account.

### 3. Master Data (/customers, /suppliers, /products, /raw-materials)
- GET /customers, POST /customers, PUT /customers/{id}, DELETE /customers/{id}
- GET /suppliers, POST /suppliers, PUT /suppliers/{id}, DELETE /suppliers/{id}
- GET /products, POST /products, PUT /products/{id}, DELETE /products/{id}
- GET /raw-materials, POST /raw-materials, PUT /raw-materials/{id}, DELETE /raw-materials/{id}

### 4. Sales Orders (/sales-orders)
- GET /sales-orders — List sales orders with status and search filters.
- GET /sales-orders/{id} — Get sales order details with items and customer.
- POST /sales-orders — Create new sales order with multi-items and GST auto-calc.
- PUT /sales-orders/{id}/status — Transition order status (CONFIRMED, SHIPPED, etc.).

### 5. Bill of Materials (/bom)
- GET /bom — List all BOM master records.
- GET /bom/product/{productId} — Get BOM for a specific product.
- POST /bom — Create product BOM with raw material ingredients and scrap rates.
- POST /bom/explode/order/{orderId} — Compute total raw material demand for a sales order.

### 6. Purchase Orders (/purchase-orders)
- GET /purchase-orders — List POs with supplier details.
- POST /purchase-orders — Issue PO to supplier for raw materials.
- PUT /purchase-orders/{id}/receive — Mark PO items as received and replenish inventory.

### 7. Invoices & Payments (/invoices, /payments)
- GET /invoices — List invoices.
- POST /invoices/generate/{salesOrderId} — Auto-generate invoice from sales order.
- POST /payments — Record payment against an invoice and compute remaining balance.

### 8. Analytics & Dashboard (/dashboard)
- GET /dashboard/stats — High-level metrics (Total Orders, Pending Orders, Revenue, Pending Payments).
- GET /dashboard/sales-trend — Monthly sales aggregation.
- GET /dashboard/low-stock — Products and raw materials below safety threshold.
