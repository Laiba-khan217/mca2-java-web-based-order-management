-- =====================================================================
-- J12: Web-Based Order Management System (Manufacturing OMS)
-- Database: MySQL 8.0 (oms_db)
-- Specification: 3NF Normalized Schema with Referential Integrity
-- =====================================================================

DROP DATABASE IF EXISTS oms_db;
CREATE DATABASE oms_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE oms_db;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NULL,
    phone VARCHAR(20) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- 3. USER_ROLES TABLE (Mapping Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(30) NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NULL,
    email VARCHAR(100) NULL,
    phone VARCHAR(20) NOT NULL,
    gstin VARCHAR(15) NULL,
    billing_address VARCHAR(255) NULL,
    city VARCHAR(50) NULL,
    state VARCHAR(50) NULL,
    pincode VARCHAR(10) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customers_code (customer_code),
    INDEX idx_customers_company (company_name),
    INDEX idx_customers_gstin (gstin)
) ENGINE=InnoDB;

-- 5. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_code VARCHAR(30) NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NULL,
    email VARCHAR(100) NULL,
    phone VARCHAR(20) NOT NULL,
    gstin VARCHAR(15) NULL,
    address VARCHAR(255) NULL,
    city VARCHAR(50) NULL,
    state VARCHAR(50) NULL,
    pincode VARCHAR(10) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_suppliers_code (supplier_code),
    INDEX idx_suppliers_company (company_name),
    INDEX idx_suppliers_gstin (gstin)
) ENGINE=InnoDB;

-- 6. PRODUCTS TABLE (Finished Goods)
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    description TEXT NULL,
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00 CHECK (gst_rate >= 0),
    uom VARCHAR(20) NOT NULL DEFAULT 'PCS',
    current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    minimum_stock_alert INT NOT NULL DEFAULT 5 CHECK (minimum_stock_alert >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_code (product_code),
    INDEX idx_products_category (category)
) ENGINE=InnoDB;

-- 7. RAW_MATERIALS TABLE
CREATE TABLE IF NOT EXISTS raw_materials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NULL,
    uom VARCHAR(20) NOT NULL,
    standard_cost DECIMAL(12, 2) NOT NULL CHECK (standard_cost >= 0),
    current_stock DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (current_stock >= 0),
    reorder_level DECIMAL(12, 2) NOT NULL DEFAULT 10.00 CHECK (reorder_level >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_materials_code (material_code),
    INDEX idx_materials_category (category)
) ENGINE=InnoDB;

-- 8. SALES_ORDERS TABLE
CREATE TABLE IF NOT EXISTS sales_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    subtotal DECIMAL(14, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    tax_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    discount_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    grand_total DECIMAL(14, 2) NOT NULL DEFAULT 0.00 CHECK (grand_total >= 0),
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_sales_order_status CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT fk_sales_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_sales_orders_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
    INDEX idx_sales_orders_number (order_number),
    INDEX idx_sales_orders_customer (customer_id),
    INDEX idx_sales_orders_status (status),
    INDEX idx_sales_orders_date (order_date)
) ENGINE=InnoDB;

-- 9. SALES_ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS sales_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sales_order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    line_tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    line_total DECIMAL(14, 2) NOT NULL CHECK (line_total >= 0),
    CONSTRAINT fk_sales_items_order FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_sales_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_sales_items_order (sales_order_id),
    INDEX idx_sales_items_product (product_id)
) ENGINE=InnoDB;

-- 10. BILLS_OF_MATERIALS TABLE (Header)
CREATE TABLE IF NOT EXISTS bills_of_materials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bom_number VARCHAR(50) NOT NULL UNIQUE,
    product_id BIGINT NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bom_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_bom_product (product_id)
) ENGINE=InnoDB;

-- 11. BOM_ITEMS TABLE (Components / Raw Materials Recipe)
CREATE TABLE IF NOT EXISTS bom_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bom_id BIGINT NOT NULL,
    raw_material_id BIGINT NOT NULL,
    quantity_required DECIMAL(12, 4) NOT NULL CHECK (quantity_required > 0),
    scrap_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (scrap_percentage >= 0),
    uom VARCHAR(20) NULL,
    CONSTRAINT fk_bom_items_bom FOREIGN KEY (bom_id) REFERENCES bills_of_materials(id) ON DELETE CASCADE,
    CONSTRAINT fk_bom_items_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id),
    INDEX idx_bom_items_bom (bom_id),
    INDEX idx_bom_items_material (raw_material_id)
) ENGINE=InnoDB;

-- 12. PURCHASE_ORDERS TABLE
CREATE TABLE IF NOT EXISTS purchase_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(40) NOT NULL UNIQUE,
    supplier_id BIGINT NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    po_date DATE NOT NULL,
    expected_delivery_date DATE NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    subtotal DECIMAL(14, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    tax_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    grand_total DECIMAL(14, 2) NOT NULL DEFAULT 0.00 CHECK (grand_total >= 0),
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_po_status CHECK (status IN ('DRAFT', 'ISSUED', 'CONFIRMED', 'SHIPPED', 'RECEIVED', 'CANCELLED')),
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT fk_po_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
    INDEX idx_po_number (po_number),
    INDEX idx_po_supplier (supplier_id),
    INDEX idx_po_status (status)
) ENGINE=InnoDB;

-- 13. PURCHASE_ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    raw_material_id BIGINT NOT NULL,
    quantity_ordered DECIMAL(12, 2) NOT NULL CHECK (quantity_ordered > 0),
    quantity_received DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (quantity_received >= 0),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    line_total DECIMAL(14, 2) NOT NULL CHECK (line_total >= 0),
    CONSTRAINT fk_po_items_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_po_items_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id),
    INDEX idx_po_items_po (purchase_order_id),
    INDEX idx_po_items_material (raw_material_id)
) ENGINE=InnoDB;

-- 14. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(40) NOT NULL UNIQUE,
    sales_order_id BIGINT NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
    subtotal DECIMAL(14, 2) NOT NULL CHECK (subtotal >= 0),
    cgst_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    sgst_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    igst_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(14, 2) NOT NULL CHECK (grand_total >= 0),
    balance_due DECIMAL(14, 2) NOT NULL CHECK (balance_due >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_invoice_status CHECK (status IN ('ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED')),
    CONSTRAINT fk_invoices_order FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
    CONSTRAINT fk_invoices_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
    INDEX idx_invoices_number (invoice_number),
    INDEX idx_invoices_order (sales_order_id),
    INDEX idx_invoices_status (status)
) ENGINE=InnoDB;

-- 15. INVOICE_ITEMS TABLE
CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    line_subtotal DECIMAL(14, 2) NOT NULL CHECK (line_subtotal >= 0),
    line_tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    line_total DECIMAL(14, 2) NOT NULL CHECK (line_total >= 0),
    CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_invoice_items_inv (invoice_id)
) ENGINE=InnoDB;

-- 16. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_number VARCHAR(40) NOT NULL UNIQUE,
    invoice_id BIGINT NOT NULL,
    recorded_by_user_id BIGINT NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(14, 2) NOT NULL CHECK (amount > 0),
    payment_mode VARCHAR(30) NOT NULL,
    transaction_reference VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payment_mode CHECK (payment_mode IN ('NEFT', 'RTGS', 'UPI', 'CHEQUE', 'BANK_TRANSFER')),
    CONSTRAINT chk_payment_status CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED')),
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    CONSTRAINT fk_payments_user FOREIGN KEY (recorded_by_user_id) REFERENCES users(id),
    INDEX idx_payments_number (payment_number),
    INDEX idx_payments_invoice (invoice_id),
    INDEX idx_payments_date (payment_date)
) ENGINE=InnoDB;
