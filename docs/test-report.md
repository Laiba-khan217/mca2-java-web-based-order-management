# Test Plan & Verification Report
## J12 – Web-Based Order Management System (Manufacturing OMS)

### 1. Test Strategy
Testing follows a multi-tier approach:
1. **Unit & Service Tests**: JUnit 5 + Mockito verifying business rules (tax math, scrap formulas, balance checks).
2. **REST API Integration Tests**: Spring Boot @SpringBootTest with MockMvc verifying JWT security filters and endpoints.
3. **Database Constraints Testing**: Checking foreign key cascades, unique keys, and check constraints in MySQL.
4. **Frontend Functional Tests**: Form validation, dynamic row additions, JWT token storage, and protected navigation.

### 2. Test Execution Matrix
| Test Case ID | Module | Scenario | Expected Result | Status |
|---|---|---|---|---|
| TC-AUTH-01 | Security | Valid login with correct BCrypt password | 200 OK + Valid JWT Token returned | PASS |
| TC-AUTH-02 | Security | Invalid password attempt | 401 Unauthorized returned | PASS |
| TC-AUTH-03 | Security | Procurement Officer accessing /api/v1/users | 403 Forbidden returned | PASS |
| TC-SO-01 | Sales Order | Create order with 2 products | 18% GST and line totals computed correctly | PASS |
| TC-BOM-01 | BOM | Explode BOM for 5 units of Centrifugal Pump | Gross material needs computed with scrap % | PASS |
| TC-PO-01 | Procurement | Receive 100m steel shaft on PO | Raw material stock increases by 100m | PASS |
| TC-INV-01 | Invoicing | Generate invoice from sales order | Intrastate splits into 9% CGST + 9% SGST | PASS |
| TC-PAY-01 | Payments | Record partial payment ₹5,00,000 on ₹8,67,300 | Balance due updates to ₹3,67,300, status PARTIALLY_PAID | PASS |
