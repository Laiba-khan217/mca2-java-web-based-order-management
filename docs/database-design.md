# Database Design & Data Dictionary
## J12 – Web-Based Order Management System (Manufacturing OMS)

### 1. Database Specifications
- **Engine**: MySQL 8.0 (InnoDB)
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Normalization**: 3NF (Third Normal Form)

### 2. Table Index & Record Count
| # | Table Name | Description | Key Indexes |
|---|------------|-------------|-------------|
| 1 | oles | System roles (Admin, Order Mgr, Procurement) | 
ame (UNIQUE) |
| 2 | users | System user accounts and BCrypt hashes | username, email |
| 3 | user_roles | User to Role M-to-M junction table | Composite PK (user_id, role_id) |
| 4 | customers | Manufacturing client accounts with GSTIN | customer_code, company_name |
| 5 | suppliers | Raw material vendors with GSTIN | supplier_code, company_name |
| 6 | products | Finished manufactured goods | product_code, category |
| 7 | aw_materials | Industrial raw materials & stock levels | material_code, category |
| 8 | sales_orders | Customer sales orders & totals | order_number, status, customer_id |
| 9 | sales_order_items | Items within each sales order | sales_order_id, product_id |
| 10| ills_of_materials | Product BOM master headers | om_number, product_id |
| 11| om_items | BOM ingredient formulas & scrap rates | om_id, aw_material_id |
| 12| purchase_orders | Procurement purchase orders to suppliers | po_number, status, supplier_id |
| 13| purchase_order_items | Material items in purchase orders | purchase_order_id, aw_material_id |
| 14| invoices | Commercial GST sales invoices | invoice_number, sales_order_id |
| 15| invoice_items | Products billed in invoice | invoice_id, product_id |
| 16| payments | Customer settlement transactions | payment_number, invoice_id |
