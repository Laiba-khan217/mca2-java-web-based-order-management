# Entity Relationship (ER) Diagram
## J12 – Web-Based Order Management System (Manufacturing OMS)

`mermaid
erDiagram
    ROLES ||--o{ USER_ROLES : has
    USERS ||--o{ USER_ROLES : assigned
    USERS ||--o{ SALES_ORDERS : creates
    USERS ||--o{ PURCHASE_ORDERS : creates
    USERS ||--o{ INVOICES : creates
    USERS ||--o{ PAYMENTS : records

    CUSTOMERS ||--o{ SALES_ORDERS : places
    SALES_ORDERS ||--|{ SALES_ORDER_ITEMS : contains
    PRODUCTS ||--o{ SALES_ORDER_ITEMS : ordered_in

    PRODUCTS ||--o{ BILLS_OF_MATERIALS : defines
    BILLS_OF_MATERIALS ||--|{ BOM_ITEMS : composed_of
    RAW_MATERIALS ||--o{ BOM_ITEMS : used_in

    SUPPLIERS ||--o{ PURCHASE_ORDERS : supplies
    PURCHASE_ORDERS ||--|{ PURCHASE_ORDER_ITEMS : includes
    RAW_MATERIALS ||--o{ PURCHASE_ORDER_ITEMS : purchased_in

    SALES_ORDERS ||--o{ INVOICES : billed_by
    INVOICES ||--|{ INVOICE_ITEMS : lists
    INVOICES ||--o{ PAYMENTS : settled_by
`
