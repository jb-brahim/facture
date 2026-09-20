# Multi-Tenant Invoicing & Billing Management System Backend

A production-ready, highly modular REST API backend for a multi-tenant business invoicing and inventory management system built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**.

Designed specifically for modern scalable SaaS architecture and ready for seamless integration with a React frontend.

---

## 🌟 Key Features

1. **Multi-Tenant Security Architecture**: Every request is strictly isolated by `companyId` extracted from authenticated JWT tokens. Company A can never access Company B's customers, products, invoices, or payments.
2. **Immutable Invoice Price Snapshots**: Historical item snapshots (product name, SKU, unit price, VAT rate, line HT, TTC) are locked when invoices are created, preserving financial accuracy even if product catalog prices change later.
3. **Atomic Stock Management**: Finalizing an invoice executes safe atomic stock deductions (`$inc` with `$gte` guards) and logs audit records in `StockMovement`.
4. **Automated Tax & Financial Calculations**: All line HT, VAT totals, TTC, discounts, and remaining balance calculations are performed server-side with customizable decimal precision (default 3 decimal places for **TND - Tunisian Dinar**).
5. **Atomic Invoice Numbering**: High-concurrency safe sequence counter generating unique company invoice references (e.g. `INV-2026-000001`).
6. **Payment Tracking & Automated Statuses**: Recording payments automatically calculates `amountPaid`, `amountDue`, and updates status (`unpaid`, `partially_paid`, `paid`, `overdue`).
7. **Dynamic PDF Engine**: Built-in PDF rendering using PDFKit with configurable template styles (`professional`, `modern`, `simple`) incorporating company branding, customer details, tax tables, and bank RIB/payment terms.
8. **Dashboard Analytics & Aggregation Reports**: Real-time sales summary, VAT breakdowns, low-stock alerts, sales by date/customer/product.
9. **Tunisia Market Compatibility**: Built-in support for TND currency, 3-decimal rounding, Matricule Fiscal (Tax ID), and Registre de Commerce fields.

---

## 📁 Project Architecture

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js             # MongoDB connection configuration
│   │   └── env.js            # Centralized environment variable loader
│   ├── models/
│   │   ├── User.js           # Authentication & role-based user model
│   │   ├── Company.js        # Tenant company profile & invoice preferences
│   │   ├── Customer.js       # Customer records (multi-tenant)
│   │   ├── Product.js        # Inventory catalog & stock settings
│   │   ├── Invoice.js        # Invoice model with item snapshot array
│   │   ├── Counter.js        # Atomic sequence counters per company/year
│   │   ├── Payment.js        # Payment records
│   │   └── StockMovement.js  # Inventory movement audit trail
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── companyController.js
│   │   ├── customerController.js
│   │   ├── productController.js
│   │   ├── invoiceController.js
│   │   ├── paymentController.js
│   │   ├── dashboardController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── productRoutes.js
│   │   ├── invoiceRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── reportRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT validation & req.companyId extraction
│   │   ├── roleMiddleware.js       # Role authorization (owner, admin, employee)
│   │   ├── validationMiddleware.js # Express-validator request wrapper
│   │   ├── errorMiddleware.js      # Centralized error handler
│   │   └── rateLimiter.js         # Security rate limiting
│   ├── services/
│   │   ├── invoiceService.js       # Draft/Finalize state machine & total calculator
│   │   ├── stockService.js         # Atomic inventory deduction & movement logger
│   │   ├── paymentService.js       # Payment sync & overdue status logic
│   │   └── pdfService.js           # PDFKit rendering engine
│   ├── validators/                 # Request payload validation rules
│   │   ├── authValidators.js
│   │   ├── companyValidators.js
│   │   ├── customerValidators.js
│   │   ├── productValidators.js
│   │   ├── invoiceValidators.js
│   │   └── paymentValidators.js
│   ├── utils/
│   │   ├── calculations.js         # Decimal-safe precision math
│   │   ├── invoiceNumber.js        # Sequential invoice number generator
│   │   ├── response.js             # Standardized API response format
│   │   └── pdfTemplates/           # Professional, Modern & Simple PDF themes
│   │       ├── professional.js
│   │       ├── modern.js
│   │       └── simple.js
│   └── app.js                      # Express application setup
├── tests/
│   └── invoicing.test.js           # Complete integration test suite
├── server.js                       # Server entrypoint
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or MongoDB Atlas)

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/invoicing_system
   JWT_SECRET=super_secret_jwt_key_2026
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   ```

3. Run in development mode:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

---

## 🔑 Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new owner & company | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | Public |
| `GET` | `/api/auth/me` | Get current user & company profile | Protected |
| `PUT` | `/api/auth/change-password` | Change authenticated user password | Protected |
| `POST` | `/api/auth/forgot-password` | Request password reset token | Public |
| `POST` | `/api/auth/reset-password` | Reset password using token | Public |

---

## 🏢 Company Endpoints (`/api/company`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/company` | Get tenant company details | Protected |
| `PUT` | `/api/company` | Update company info & invoice preferences | Owner / Admin |

---

## 👥 Customer Endpoints (`/api/customers`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/customers` | Create a customer | Protected |
| `GET` | `/api/customers` | List customers (paginated, filtered) | Protected |
| `GET` | `/api/customers/search?q=` | Fast search by name, phone, email, tax ID | Protected |
| `GET` | `/api/customers/:id` | Get customer details by ID | Protected |
| `PUT` | `/api/customers/:id` | Update customer | Protected |
| `DELETE` | `/api/customers/:id` | Deactivate customer (soft delete) | Protected |

---

## 📦 Product Endpoints (`/api/products`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/products` | Create a product | Protected |
| `GET` | `/api/products` | List products (paginated, category filter) | Protected |
| `GET` | `/api/products/search?q=` | Fast search by name, reference/SKU, barcode | Protected |
| `GET` | `/api/products/:id` | Get product details by ID | Protected |
| `PUT` | `/api/products/:id` | Update product details | Protected |
| `DELETE` | `/api/products/:id` | Deactivate product (soft delete) | Protected |

---

## 📄 Invoice Endpoints (`/api/invoices`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/invoices` | Create draft invoice (server calculates totals) | Protected |
| `GET` | `/api/invoices` | List invoices (`status`, `paymentStatus`, date range) | Protected |
| `GET` | `/api/invoices/:id` | Get single invoice with customer details | Protected |
| `PUT` | `/api/invoices/:id` | Update draft invoice | Protected |
| `DELETE` | `/api/invoices/:id` | Delete draft invoice | Protected |
| `POST` | `/api/invoices/:id/finalize` | Finalize invoice, generate number & deduct stock | Protected |
| `POST` | `/api/invoices/:id/cancel` | Cancel invoice & restore stock | Protected |
| `GET` | `/api/invoices/:id/pdf` | Generate & stream PDF invoice | Protected |
| `GET` | `/api/invoices/:id/payments` | Get payment history for an invoice | Protected |
| `POST` | `/api/invoices/:invoiceId/payments` | Record payment for invoice | Protected |

---

## 📊 Dashboard & Reports (`/api/dashboard`, `/api/reports`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Today/Monthly sales, unpaid/overdue counts, low stock | Protected |
| `GET` | `/api/reports/sales` | Sales breakdown by date range | Protected |
| `GET` | `/api/reports/by-customer` | Sales breakdown by customer | Protected |
| `GET` | `/api/reports/by-product` | Sales breakdown by product | Protected |
| `GET` | `/api/reports/vat` | VAT summary by tax rate | Protected |

---

## 🔒 Security Best Practices Implemented

- **JWT Authentication** with expiration.
- **Bcrypt password hashing** with salt factor 10.
- **Helmet HTTP headers** protection.
- **CORS handling** configured for client frontend integration.
- **Express Rate Limiting** on authentication and general API endpoints.
- **Input validation** via `express-validator`.
- **Database level multi-tenant query scoping** using indexed `companyId`.

---

## 📄 License

MIT License - free for commercial and private use.
