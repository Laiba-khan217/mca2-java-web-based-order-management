-- =====================================================================
-- J12: Web-Based Order Management System (Manufacturing OMS)
-- Database: MySQL 8.0 (oms_db)
-- Seed Data: Realistic Indian Manufacturing Context
-- Demo Logins:
--   Admin:               admin / Admin@123
--   Order Manager:       ordermanager / Order@123
--   Procurement Officer: procurement / Procure@123
-- =====================================================================

USE oms_db;

-- Clear tables in reverse dependency order to prevent FK violations
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE payments;
TRUNCATE TABLE invoice_items;
TRUNCATE TABLE invoices;
TRUNCATE TABLE purchase_order_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE bom_items;
TRUNCATE TABLE bills_of_materials;
TRUNCATE TABLE sales_order_items;
TRUNCATE TABLE sales_orders;
TRUNCATE TABLE raw_materials;
TRUNCATE TABLE products;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE customers;
TRUNCATE TABLE user_roles;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'System Administrator with full access to all modules and configurations'),
(2, 'ROLE_ORDER_MANAGER', 'Order Manager managing customers, sales orders, BOM, invoices, and payments'),
(3, 'ROLE_PROCUREMENT_OFFICER', 'Procurement Officer managing suppliers, raw materials, and purchase orders');

-- 2. USERS (BCrypt encrypted passwords)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, is_active) VALUES
(1, 'admin', 'admin@apexmanufacturing.in', '$2b$10$0AJV2pbsiBEUeV6XPLyrCerL3G5kerKg388bj3U20v3X8KjMq7qYC', 'Rajesh', 'Sharma', '+91-9820011223', TRUE),
(2, 'ordermanager', 'priya.patel@apexmanufacturing.in', '$2b$10$rat8gmgiQAx4rQzk9mBJw.4zBIUQ8xM.BMAe.7IchDYfLLnPJGV0q', 'Priya', 'Patel', '+91-9876543210', TRUE),
(3, 'procurement', 'amit.verma@apexmanufacturing.in', '$2b$10$Q9QU2AxtN71scwAXbZ4UKOh4DXIn39Ie2i2qdYqxVgw3I28Agnkpq', 'Amit', 'Verma', '+91-9811223344', TRUE);

-- 3. USER_ROLES
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3);

-- 4. CUSTOMERS (Indian Manufacturing Clients)
INSERT INTO customers (id, customer_code, company_name, contact_person, email, phone, gstin, billing_address, city, state, pincode, is_active) VALUES
(1, 'CUST-1001', 'Tata Heavy Motors Ltd.', 'Vikas Deshmukh', 'purchase@tatamotors.com', '+91-9822019283', '27AAACT2727Q1ZW', 'MIDC Industrial Estate, Bhosari', 'Pune', 'Maharashtra', '411026', TRUE),
(2, 'CUST-1002', 'Larsen & Infrastructure Projects', 'Ananya Sengupta', 'procure@larsentoubro.com', '+91-9833445566', '27AAACL3456F1Z2', 'L&T Technology Park, Powai', 'Mumbai', 'Maharashtra', '400072', TRUE),
(3, 'CUST-1003', 'Bharat Electricals & Switchgears', 'Karthik Raman', 'karthik@bharatelec.co.in', '+91-9845012345', '29AAACB8901D1Z4', 'Electronic City Phase II', 'Bengaluru', 'Karnataka', '560100', TRUE),
(4, 'CUST-1004', 'Delhi Metro Heavy Rail Corp.', 'Sunil Aggarwal', 'contracts@delhimetrorail.gov.in', '+91-9810112233', '07AAACD1122C1Z8', 'Metro Bhawan, Fire Brigade Lane', 'New Delhi', 'Delhi', '110001', TRUE),
(5, 'CUST-1005', 'Godrej Industrial Solutions', 'Meera Subramaniam', 'meera.s@godrejind.com', '+91-9840223344', '33AAACG5566G1ZQ', 'Ambattur Industrial Estate', 'Chennai', 'Tamil Nadu', '600058', TRUE),
(6, 'CUST-1006', 'Mahindra Heavy Engineering', 'Sanjay Gokhale', 'gokhale.s@mahindra.com', '+91-9823114455', '27AAACM7788H1ZS', 'Satpur MIDC', 'Nashik', 'Maharashtra', '422007', TRUE),
(7, 'CUST-1007', 'Thermax Energy Systems Ltd.', 'Deepak Joshi', 'djoshi@thermaxglobal.com', '+91-9822556677', '27AAACT9900J1ZU', 'Thermax House, Wakdewadi', 'Pune', 'Maharashtra', '411005', TRUE),
(8, 'CUST-1008', 'BHEL Heavy Power Equipments', 'Venkat Reddy', 'procurement@bhelhyd.co.in', '+91-9849112233', '36AAACB1234K1ZW', 'Ramachandrapuram', 'Hyderabad', 'Telangana', '502032', TRUE),
(9, 'CUST-1009', 'Kirloskar Heavy Pumps Division', 'Prashant Kadam', 'pkadam@kirloskarpumps.com', '+91-9822889900', '27AAACK5678L1ZY', 'Udyog Bhavan, Shivaji Nagar', 'Kolhapur', 'Maharashtra', '416008', TRUE),
(10, 'CUST-1010', 'Reliance Petrochemicals Infrastructure', 'Nilesh Shah', 'nshah@rilchem.com', '+91-9879112233', '24AAACR9012M1Z0', 'Refinery Complex, Moti Khavdi', 'Jamnagar', 'Gujarat', '361140', TRUE);

-- 5. SUPPLIERS (Indian Industrial Raw Material Vendors)
INSERT INTO suppliers (id, supplier_code, company_name, contact_person, email, phone, gstin, address, city, state, pincode, is_active) VALUES
(1, 'SUPP-2001', 'Jindal Alloy & Steel Tubes Ltd.', 'Ramesh Jindal', 'sales@jindalsteel.in', '+91-9752112233', '22AAACJ4455P1ZK', 'Industrial Growth Centre', 'Raigarh', 'Chhattisgarh', '496001', TRUE),
(2, 'SUPP-2002', 'Hindalco Industrial Metals Ltd.', 'Suresh Agarwal', 'orders@hindalco.adityabirla.com', '+91-9450112233', '09AAACH6677R1ZM', 'Renukoot Works', 'Renukoot', 'Uttar Pradesh', '231217', TRUE),
(3, 'SUPP-2003', 'Precision Fasteners & Bolts India', 'Harpreet Singh', 'harpreet@precisionfasteners.com', '+91-9812334455', '06AAACP8899T1ZP', 'Sector 24 Industrial Area', 'Faridabad', 'Haryana', '121005', TRUE),
(4, 'SUPP-2004', 'Sterlite Copper Wires & Cables', 'Manish Mehta', 'orders@sterlitecopper.in', '+91-9824112233', '26AAACS1122V1ZR', 'Piparia Industrial Area', 'Silvassa', 'Dadra and Nagar Haveli', '396230', TRUE),
(5, 'SUPP-2005', 'SKF Bearings & Seals India Ltd.', 'Rohan Roy', 'oem@skfindia.com', '+91-9822334455', '27AAACS3344X1ZT', 'Chinchwad Works', 'Pune', 'Maharashtra', '411033', TRUE),
(6, 'SUPP-2006', 'Bharat Heavy Castings & Foundry', 'M. Natarajan', 'sales@bharatcastings.co.in', '+91-9842112233', '33AAACB5566Z1ZV', 'SIDCO Industrial Estate', 'Coimbatore', 'Tamil Nadu', '641021', TRUE),
(7, 'SUPP-2007', 'Asian Paints Industrial Coatings', 'Gaurav Parekh', 'industrial@asianpaints.com', '+91-9825112233', '24AAACA7788B1ZX', 'GIDC Industrial Area', 'Ankleshwar', 'Gujarat', '393002', TRUE),
(8, 'SUPP-2008', 'Crompton Electrical Insulation', 'Naveen Dave', 'dave@cromptoninsul.in', '+91-9824556677', '24AAACC9900D1ZZ', 'Makarpura GIDC', 'Vadodara', 'Gujarat', '390010', TRUE);

-- 6. PRODUCTS (Manufactured Industrial Goods)
INSERT INTO products (id, product_code, name, category, description, unit_price, gst_rate, uom, current_stock, minimum_stock_alert, is_active) VALUES
(1, 'PROD-101', 'Centrifugal Industrial Pump 15HP', 'Industrial Pumps', 'Heavy duty cast iron centrifugal water pump with TEFC motor mount and mechanical seal', 85000.00, 18.00, 'PCS', 12, 4, TRUE),
(2, 'PROD-102', '3-Phase Induction Motor 25KW', 'Electric Motors', '415V 50Hz Class-F insulation high efficiency squirrel cage induction motor', 120000.00, 18.00, 'PCS', 8, 3, TRUE),
(3, 'PROD-103', 'Automated Industrial Roller Conveyor 10m', 'Material Handling', 'Heavy duty powered modular roller conveyor with side guards and variable frequency drive', 245000.00, 18.00, 'PCS', 5, 2, TRUE),
(4, 'PROD-104', 'High Pressure Pneumatic Control Valve', 'Valves & Actuators', 'Flanged 3-way proportional electro-pneumatic control valve for chemical/steam line', 32500.00, 18.00, 'PCS', 20, 5, TRUE),
(5, 'PROD-105', 'Industrial Helical Gearbox 40:1', 'Power Transmission', 'Foot mounted hardened steel ground helical speed reducer gearbox', 68000.00, 18.00, 'PCS', 10, 3, TRUE),
(6, 'PROD-106', 'Stainless Steel Mixing Tank 500L', 'Process Equipment', 'SS-304 food & chemical grade jacketed insulated mixing vessel with agitator mount', 175000.00, 18.00, 'PCS', 4, 2, TRUE),
(7, 'PROD-107', 'Hydraulic Power Pack Unit 10HP', 'Hydraulics', 'Compact hydraulic power unit with vane pump, manifold block, oil reservoir and gauge', 140000.00, 18.00, 'PCS', 6, 2, TRUE),
(8, 'PROD-108', 'Heavy Duty Industrial Exhaust Blower', 'Ventilation', 'Direct-drive centrifugal industrial exhaust blower fan for foundry and factory ventilation', 45000.00, 18.00, 'PCS', 15, 4, TRUE);

-- 7. RAW MATERIALS
INSERT INTO raw_materials (id, material_code, name, category, uom, standard_cost, current_stock, reorder_level, is_active) VALUES
(1, 'MAT-201', 'Cast Iron Pump Housing Casing', 'Castings', 'PCS', 4500.00, 85.00, 20.00, TRUE),
(2, 'MAT-202', 'Copper Winding Wire 1.2mm Grade 2', 'Non-Ferrous Metals', 'KG', 780.00, 450.00, 100.00, TRUE),
(3, 'MAT-203', 'EN8 High Tensile Steel Shaft 50mm', 'Steel Alloys', 'MTR', 1250.00, 120.00, 30.00, TRUE),
(4, 'MAT-204', 'High Precision Ball Bearing #6208', 'Bearings', 'PCS', 650.00, 200.00, 50.00, TRUE),
(5, 'MAT-205', 'Mechanical Shaft Seal 45mm Tungsten', 'Seals', 'PCS', 1100.00, 75.00, 25.00, TRUE),
(6, 'MAT-206', 'M12 Grade 8.8 High Strength Bolts', 'Fasteners', 'PCS', 25.00, 3500.00, 500.00, TRUE),
(7, 'MAT-207', 'Stainless Steel Sheet SS-304 3mm', 'Sheet Metal', 'KG', 320.00, 800.00, 200.00, TRUE),
(8, 'MAT-208', 'Industrial Epoxy Powder Coating Sky Blue', 'Chemicals & Paints', 'KG', 450.00, 160.00, 40.00, TRUE),
(9, 'MAT-209', 'Class-F Stator Core Stampings Set', 'Electrical Components', 'SET', 3800.00, 40.00, 15.00, TRUE),
(10, 'MAT-210', 'Heavy Duty Neoprene Rubber Gaskets', 'Gaskets', 'PCS', 180.00, 320.00, 80.00, TRUE),
(11, 'MAT-211', 'Mild Steel Channel 100x50mm', 'Structural Steel', 'MTR', 620.00, 280.00, 60.00, TRUE),
(12, 'MAT-212', 'Hydraulic Seamless Honed Tube 25mm', 'Pipes & Tubes', 'MTR', 890.00, 90.00, 25.00, TRUE);

-- 8. BILLS OF MATERIALS (BOM)
INSERT INTO bills_of_materials (id, bom_number, product_id, version, is_active, notes) VALUES
(1, 'BOM-PROD-101-v1', 1, '1.0', TRUE, 'Standard production BOM for 15HP Centrifugal Pump'),
(2, 'BOM-PROD-102-v1', 2, '1.0', TRUE, 'Production recipe for 25KW 3-Phase Induction Motor'),
(3, 'BOM-PROD-103-v1', 3, '1.0', TRUE, '10-meter modular conveyor frame and drive assembly'),
(4, 'BOM-PROD-104-v1', 4, '1.0', TRUE, 'Pneumatic valve casting and seal configuration');

-- 9. BOM ITEMS (Recipe Ingredients with Scrap factor)
-- BOM 1: Centrifugal Pump
INSERT INTO bom_items (bom_id, raw_material_id, quantity_required, scrap_percentage, uom) VALUES
(1, 1, 1.0000, 0.00, 'PCS'),      -- 1 Cast Iron Casing
(1, 3, 1.5000, 3.00, 'MTR'),      -- 1.5 Mtr Steel Shaft
(1, 4, 2.0000, 0.00, 'PCS'),      -- 2 Ball Bearings
(1, 5, 1.0000, 2.00, 'PCS'),      -- 1 Mechanical Seal
(1, 6, 16.0000, 5.00, 'PCS'),     -- 16 Bolts
(1, 10, 2.0000, 5.00, 'PCS'),     -- 2 Gaskets
(1, 8, 2.5000, 5.00, 'KG');       -- 2.5 KG Epoxy Coating

-- BOM 2: Induction Motor 25KW
INSERT INTO bom_items (bom_id, raw_material_id, quantity_required, scrap_percentage, uom) VALUES
(2, 2, 18.0000, 4.00, 'KG'),      -- 18 KG Copper Wire
(2, 9, 1.0000, 0.00, 'SET'),      -- 1 Stator Stampings Set
(2, 3, 1.2000, 2.00, 'MTR'),      -- 1.2 Mtr Shaft
(2, 4, 2.0000, 0.00, 'PCS'),      -- 2 Bearings
(2, 1, 1.0000, 0.00, 'PCS'),      -- 1 Housing Casing
(2, 6, 12.0000, 5.00, 'PCS'),     -- 12 Bolts
(2, 8, 3.0000, 5.00, 'KG');       -- 3 KG Coating

-- BOM 3: Conveyor 10m
INSERT INTO bom_items (bom_id, raw_material_id, quantity_required, scrap_percentage, uom) VALUES
(3, 11, 24.0000, 5.00, 'MTR'),    -- 24 Mtr MS Channel
(3, 4, 16.0000, 0.00, 'PCS'),     -- 16 Bearings
(3, 6, 48.0000, 5.00, 'PCS'),     -- 48 Bolts
(3, 8, 6.0000, 8.00, 'KG');       -- 6 KG Coating

-- BOM 4: Pneumatic Valve
INSERT INTO bom_items (bom_id, raw_material_id, quantity_required, scrap_percentage, uom) VALUES
(4, 1, 1.0000, 0.00, 'PCS'),      -- 1 Casing
(4, 7, 3.5000, 4.00, 'KG'),       -- 3.5 KG SS Sheet
(4, 10, 3.0000, 2.00, 'PCS'),     -- 3 Gaskets
(4, 6, 8.0000, 5.00, 'PCS');      -- 8 Bolts

-- 10. SALES ORDERS
INSERT INTO sales_orders (id, order_number, customer_id, created_by_user_id, order_date, expected_delivery_date, status, subtotal, tax_amount, discount_amount, grand_total, notes) VALUES
(1, 'SO-2026-0001', 1, 2, '2026-10-15', '2026-11-05', 'DELIVERED', 425000.00, 76500.00, 0.00, 501500.00, 'Dispatched via VRL Logistics. Received in good condition.'),
(2, 'SO-2026-0002', 2, 2, '2026-10-22', '2026-11-15', 'SHIPPED', 735000.00, 132300.00, 0.00, 867300.00, 'Consignment en route to L&T Powai site.'),
(3, 'SO-2026-0003', 3, 2, '2026-11-02', '2026-11-25', 'PROCESSING', 245000.00, 44100.00, 0.00, 289100.00, 'Assembly underway on shop floor line 2.'),
(4, 'SO-2026-0004', 4, 2, '2026-11-10', '2026-12-05', 'CONFIRMED', 340000.00, 61200.00, 0.00, 401200.00, 'BOM generated. Material allocation verified.'),
(5, 'SO-2026-0005', 5, 2, '2026-11-14', '2026-12-10', 'PENDING', 97500.00, 17550.00, 0.00, 115050.00, 'Awaiting credit terms approval from finance.'),
(6, 'SO-2026-0006', 6, 2, '2026-11-01', '2026-11-15', 'CANCELLED', 120000.00, 21600.00, 0.00, 141600.00, 'Order cancelled by customer due to revised plant specs.'),
(7, 'SO-2026-0007', 7, 2, '2026-11-16', '2026-12-12', 'CONFIRMED', 170000.00, 30600.00, 0.00, 200600.00, 'Standard 15HP pumps for water treatment plant.'),
(8, 'SO-2026-0008', 9, 2, '2026-10-10', '2026-10-30', 'DELIVERED', 85000.00, 15300.00, 0.00, 100300.00, 'Special test pump delivered to Kolhapur R&D lab.');

-- 11. SALES ORDER ITEMS
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, gst_rate, line_tax, line_total) VALUES
-- SO-0001 (Tata Motors: 5x Pump 15HP)
(1, 1, 5, 85000.00, 18.00, 76500.00, 501500.00),

-- SO-0002 (L&T: 3x Conveyor 10m)
(2, 3, 3, 245000.00, 18.00, 132300.00, 867300.00),

-- SO-0003 (Bharat Electricals: 1x Conveyor + 2x Valve)
(3, 3, 1, 245000.00, 18.00, 44100.00, 289100.00),

-- SO-0004 (Delhi Metro: 4x Pump 15HP)
(4, 1, 4, 85000.00, 18.00, 61200.00, 401200.00),

-- SO-0005 (Godrej: 3x Valve)
(5, 4, 3, 32500.00, 18.00, 17550.00, 115050.00),

-- SO-0006 (Mahindra: 1x Motor 25KW - Cancelled)
(6, 2, 1, 120000.00, 18.00, 21600.00, 141600.00),

-- SO-0007 (Thermax: 2x Pump 15HP)
(7, 1, 2, 85000.00, 18.00, 30600.00, 200600.00),

-- SO-0008 (Kirloskar: 1x Pump 15HP)
(8, 1, 1, 85000.00, 18.00, 15300.00, 100300.00);

-- 12. PURCHASE ORDERS (Procurement for Raw Materials)
INSERT INTO purchase_orders (id, po_number, supplier_id, created_by_user_id, po_date, expected_delivery_date, status, subtotal, tax_amount, grand_total, notes) VALUES
(1, 'PO-2026-0001', 1, 3, '2026-10-05', '2026-10-18', 'RECEIVED', 125000.00, 22500.00, 147500.00, 'Batch of 100m EN8 Steel Shafts received and QC passed.'),
(2, 'PO-2026-0002', 4, 3, '2026-10-12', '2026-10-25', 'RECEIVED', 234000.00, 42120.00, 276120.00, '300 KG Copper Winding wire received in store.'),
(3, 'PO-2026-0003', 5, 3, '2026-11-04', '2026-11-20', 'SHIPPED', 97500.00, 17550.00, 115050.00, '150 PCS Ball Bearings in transit from Pune works.'),
(4, 'PO-2026-0004', 3, 3, '2026-11-08', '2026-11-22', 'CONFIRMED', 50000.00, 9000.00, 59000.00, '2000 PCS M12 Fasteners confirmed by supplier.'),
(5, 'PO-2026-0005', 6, 3, '2026-11-15', '2026-12-01', 'DRAFT', 180000.00, 32400.00, 212400.00, 'Draft PO for 40 units Pump Castings.'),
(6, 'PO-2026-0006', 7, 3, '2026-10-20', '2026-11-05', 'CANCELLED', 45000.00, 8100.00, 53100.00, 'Cancelled due to alternate inventory transfer.');

-- 13. PURCHASE ORDER ITEMS
INSERT INTO purchase_order_items (purchase_order_id, raw_material_id, quantity_ordered, quantity_received, unit_price, line_total) VALUES
-- PO 1: 100m Shaft from Jindal Steel
(1, 3, 100.00, 100.00, 1250.00, 125000.00),

-- PO 2: 300 KG Copper Wire from Sterlite
(2, 2, 300.00, 300.00, 780.00, 234000.00),

-- PO 3: 150 PCS Ball Bearings from SKF
(3, 4, 150.00, 0.00, 650.00, 97500.00),

-- PO 4: 2000 PCS M12 Bolts from Precision Fasteners
(4, 6, 2000.00, 0.00, 25.00, 50000.00),

-- PO 5: 40 PCS Castings from Bharat Heavy Castings
(5, 1, 40.00, 0.00, 4500.00, 180000.00),

-- PO 6: 100 KG Epoxy Powder Coating
(6, 8, 100.00, 0.00, 450.00, 45000.00);

-- 14. INVOICES (Generated against Sales Orders)
INSERT INTO invoices (id, invoice_number, sales_order_id, created_by_user_id, invoice_date, due_date, status, subtotal, cgst_amount, sgst_amount, igst_amount, grand_total, balance_due) VALUES
-- Invoice 1 for SO-0001 (Intrastate MH: CGST 9% + SGST 9%)
(1, 'INV-2026-0001', 1, 2, '2026-10-18', '2026-11-18', 'PAID', 425000.00, 38250.00, 38250.00, 0.00, 501500.00, 0.00),

-- Invoice 2 for SO-0002 (Intrastate MH: CGST 9% + SGST 9%)
(2, 'INV-2026-0002', 2, 2, '2026-10-25', '2026-11-25', 'PARTIALLY_PAID', 735000.00, 66150.00, 66150.00, 0.00, 867300.00, 367300.00),

-- Invoice 3 for SO-0003 (Interstate KA: IGST 18%)
(3, 'INV-2026-0003', 3, 2, '2026-11-05', '2026-12-05', 'ISSUED', 245000.00, 0.00, 0.00, 44100.00, 289100.00, 289100.00),

-- Invoice 4 for SO-0008 (Intrastate MH: CGST 9% + SGST 9%)
(4, 'INV-2026-0004', 8, 2, '2026-10-12', '2026-11-12', 'PAID', 85000.00, 7650.00, 7650.00, 0.00, 100300.00, 0.00);

-- 15. INVOICE ITEMS
INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, line_subtotal, line_tax, line_total) VALUES
(1, 1, 5, 85000.00, 425000.00, 76500.00, 501500.00),
(2, 3, 3, 245000.00, 735000.00, 132300.00, 867300.00),
(3, 3, 1, 245000.00, 245000.00, 44100.00, 289100.00),
(4, 1, 1, 85000.00, 85000.00, 15300.00, 100300.00);

-- 16. PAYMENTS (Customer settlements against Invoices)
INSERT INTO payments (id, payment_number, invoice_id, recorded_by_user_id, payment_date, amount, payment_mode, transaction_reference, status, remarks) VALUES
-- Full payment for Invoice 1 via RTGS
(1, 'PAY-2026-0001', 1, 2, '2026-11-02', 501500.00, 'RTGS', 'SBIN002981729188', 'SUCCESS', 'Settled in full by Tata Motors treasury account.'),

-- Partial payment of 5 Lakhs for Invoice 2 via NEFT
(2, 'PAY-2026-0002', 2, 2, '2026-11-10', 500000.00, 'NEFT', 'HDFC001182763519', 'SUCCESS', 'Part payment received. Remaining 3,67,300 due on 25-Nov.'),

-- Full payment for Invoice 4 via UPI
(3, 'PAY-2026-0003', 4, 2, '2026-10-28', 100300.00, 'UPI', 'UPI/412389172918/Kirloskar', 'SUCCESS', 'Instant settlement via corporate UPI QR code.');
