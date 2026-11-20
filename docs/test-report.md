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
|---|---|---|---|:---:|
| **TC-AUTH-01** | Security | Valid login with correct BCrypt password (`admin` / `Admin@123`) | 200 OK + Valid JWT Token returned | **PASS** |
| **TC-AUTH-02** | Security | Multi-role login (`ordermanager` / `procurement`) | Correct roles (`ROLE_ORDER_MANAGER`, `ROLE_PROCUREMENT_OFFICER`) assigned | **PASS** |
| **TC-AUTH-03** | Security | Unauthenticated request to protected endpoint (`/api/v1/customers`) | 401 Unauthorized returned | **PASS** |
| **TC-SO-01** | Sales Order | Create order with 2 finished goods items | 18% GST and line totals computed correctly, Order Number formatted `SO-YYYY-XXXX` | **PASS** |
| **TC-SO-02** | Sales Order | Update order status to `CONFIRMED` | Status updated and reflected across dashboard | **PASS** |
| **TC-BOM-01** | BOM | Explode BOM for order and finished product | Gross material demand computed with scrap buffer: $\sum (\text{Qty} \times \text{Req} \times (1 + \text{Scrap}\%))$ | **PASS** |
| **TC-BOM-02** | BOM | Shortfall calculation against warehouse stock | Identifies shortfalls and estimates total procurement cost | **PASS** |
| **TC-PO-01** | Procurement | Create PO for shortfall materials against supplier | Subtotal + 18% GST calculated, PO Number formatted `PO-YYYY-XXXX` | **PASS** |
| **TC-PO-02** | Procurement | Receive goods on PO items (GRN) | Automatically increments `raw_materials.current_stock` in MySQL and sets status to `RECEIVED` | **PASS** |
| **TC-INV-01** | Invoicing | Generate Tax Invoice from confirmed sales order | Intrastate (Maharashtra) splits into 9% CGST + 9% SGST; Interstate applies 18% IGST | **PASS** |
| **TC-PAY-01** | Payments | Record partial payment against invoice (NEFT) | Balance due reduced, invoice status updated to `PARTIALLY_PAID` | **PASS** |
| **TC-DASH-01** | Dashboard | Fetch executive metrics (`/api/v1/dashboard/stats`) | Aggregates revenue, procurement spend, low-stock material alerts, and monthly trends | **PASS** |

---

### 3. Automated Test Suite Results (Maven Surefire)
```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.oms.OmsApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 24.50 s -- in com.oms.OmsApplicationTests
[INFO] Running com.oms.service.BomServiceTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.007 s -- in com.oms.service.BomServiceTest
[INFO] Running com.oms.service.InvoicePaymentServiceTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.141 s -- in com.oms.service.InvoicePaymentServiceTest
[INFO] 
[INFO] Results:
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```
