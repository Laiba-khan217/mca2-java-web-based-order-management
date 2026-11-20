# Viva-Voce Examination Preparation Guide
## J12 – Web-Based Order Management System for Manufacturing Organization
### MCA 2nd Year Project Viva Questions & Answers

---

### Category 1: Architecture & Tech Stack

#### Q1: What is the high-level architecture of your project?
**Answer:**
The project uses a modern **Three-Tier Decoupled Client-Server Architecture**:
1. **Presentation Tier (Frontend):** Built with React 18 and Vite, consuming backend RESTful services via Axios with JWT interceptors. Styled using Bootstrap 5.
2. **Application Tier (Backend):** Built with Java 17 and Spring Boot 3.3.5 following a Layered Pattern (Controllers &rarr; Services &rarr; Repositories &rarr; Domain Entities). Spring Security 6 provides stateless authentication.
3. **Database Tier (Storage):** MySQL 8.0 relational database designed in Third Normal Form (3NF) with foreign key integrity and ACID guarantees.

#### Q2: Why did you choose React over Angular and MySQL over Oracle Database?
**Answer:**
- **React vs Angular:** React provides a lightweight, virtual-DOM-based component model with fast re-rendering and rapid build tooling via Vite. It allows modular state management via Context API without the heavy boilerplate and opinionated framework overhead of Angular.
- **MySQL vs Oracle:** MySQL 8 is open-source, highly performant, widely adopted in modern web microservices, and easily containerized. It provides complete ANSI SQL compliance, JSON functions, and row-level locking without enterprise licensing constraints.

---

### Category 2: Security & Authentication

#### Q3: How is authentication and authorization handled?
**Answer:**
We implemented **Stateless JWT (JSON Web Token) Authentication** using Spring Security 6:
1. The user posts credentials (`username`, `password`) to `/api/v1/auth/login`.
2. `AuthenticationManager` verifies the username and matches the password using `BCryptPasswordEncoder`.
3. Upon validation, `JwtTokenProvider` generates a signed HMAC-SHA256 token containing the user's ID, username, and assigned roles, set with a 24-hour expiration.
4. On subsequent requests, the frontend Axios interceptor attaches the token in the `Authorization: Bearer <token>` header.
5. `JwtAuthenticationFilter` intercepts the request, validates token integrity and signature, loads `UserPrincipal`, and populates `SecurityContextHolder`.

#### Q4: What is BCrypt and why is it preferred over SHA-256 or MD5?
**Answer:**
MD5 and standard SHA-256 are fast cryptographic hashes that are vulnerable to brute-force and rainbow table lookups. **BCrypt** is an adaptive, salted hash based on the Blowfish cipher. It incorporates a random 16-byte salt and an exponential work factor (10 rounds in our project). This makes rainbow tables impossible and brute-force computationally prohibitive.

---

### Category 3: Manufacturing & Core Domain Logic

#### Q5: What is a Bill of Materials (BOM) and how does BOM Explosion work?
**Answer:**
A **Bill of Materials (BOM)** is an engineering recipe that specifies the raw materials, components, and quantities required to manufacture one unit of a finished product.
**BOM Explosion** is the algorithm that computes gross component demand for an entire customer order:
$$\text{Total Component Required} = \sum \Big(\text{Order Quantity} \times \text{Quantity Required per Unit} \times \big(1 + \frac{\text{Scrap Percentage}}{100}\big)\Big)$$
It then queries `raw_materials.current_stock` to identify **Shortfalls**:
$$\text{Shortfall} = \max(0, \text{Total Component Required} - \text{Current Stock})$$
If a shortfall exists, it estimates procurement costs and enables one-click Purchase Order creation.

#### Q6: How does the Goods Receipt Note (GRN) update warehouse inventory?
**Answer:**
When purchased items arrive from a vendor, the procurement officer enters the received quantity in the Goods Receipt screen (`POST /api/v1/purchase-orders/{id}/receive`). The service runs inside an `@Transactional` block:
1. It adds the quantity received to `purchase_order_items.quantity_received`.
2. It executes an update on `raw_materials.current_stock`:
   $$\text{new\_stock} = \text{current\_stock} + \text{quantity\_received}$$
3. If all items are satisfied, the PO status transitions to `RECEIVED`.

#### Q7: How does Indian GST calculation work in Invoicing?
**Answer:**
We check the Customer's state against the company's home state (Maharashtra, State Code 27):
- **Intrastate Supply (Maharashtra):** The 18% GST is split equally into **9% CGST (Central Tax)** and **9% SGST (State Tax)**.
- **Interstate Supply (Other states like Karnataka, Delhi, Tamil Nadu):** The entire 18% is billed as **IGST (Integrated Tax)**.

---

### Category 4: Database Design & JPA

#### Q8: What normalization level is achieved in your database?
**Answer:**
The schema strictly achieves **Third Normal Form (3NF)**:
- **1NF:** Atomic attribute values, no repeating groups, unique primary keys on every table.
- **2NF:** All non-key attributes are fully functionally dependent on the primary key (composite key in `user_roles` properly isolated).
- **3NF:** No transitive dependencies. For instance, customer address and GSTIN live in `customers`, referenced by `customer_id` in `sales_orders`, avoiding redundant storage of customer attributes in order records.

#### Q9: What is the role of Spring Data JPA and Hibernate?
**Answer:**
- **Hibernate ORM** is the Object-Relational Mapping engine that maps Java entity classes (`@Entity`, `@Table`) to MySQL tables.
- **Spring Data JPA** provides repository abstractions (`JpaRepository<T, ID>`) eliminating boilerplate data access code and providing built-in pagination, sorting, and dynamic query derivation (`findByOrderNumber`, `findByProductIdAndIsActiveTrue`).
