const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Company = require('../src/models/Company');
const Product = require('../src/models/Product');
const Customer = require('../src/models/Customer');
const Invoice = require('../src/models/Invoice');
const StockMovement = require('../src/models/StockMovement');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Invoicing & Billing Management System Integration Tests', () => {
  let userA, tokenA, companyAId;
  let userB, tokenB, companyBId;

  const setupCompaniesAndUsers = async () => {
    // Register Company A
    const resA = await request(app).post('/api/auth/register').send({
      companyName: 'Company Alpha',
      name: 'Alpha Owner',
      email: 'owner@alpha.com',
      password: 'password123',
      phone: '+21698000001'
    });
    tokenA = resA.body.data.token;
    companyAId = resA.body.data.user.companyId;
    userA = resA.body.data.user;

    // Register Company B
    const resB = await request(app).post('/api/auth/register').send({
      companyName: 'Company Beta',
      name: 'Beta Owner',
      email: 'owner@beta.com',
      password: 'password123',
      phone: '+21698000002'
    });
    tokenB = resB.body.data.token;
    companyBId = resB.body.data.user.companyId;
    userB = resB.body.data.user;
  };

  describe('1. Authentication & Multi-Tenant Setup', () => {
    it('should register users and create distinct company profiles', async () => {
      await setupCompaniesAndUsers();
      expect(tokenA).toBeDefined();
      expect(tokenB).toBeDefined();
      expect(companyAId).not.toEqual(companyBId);
    });

    it('should login user and return JWT', async () => {
      await setupCompaniesAndUsers();
      const res = await request(app).post('/api/auth/login').send({
        email: 'owner@alpha.com',
        password: 'password123'
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });
  });

  describe('2. Multi-Tenant Data Isolation Security', () => {
    it('Company A should NOT be able to access or modify Company B data', async () => {
      await setupCompaniesAndUsers();

      // Create Product in Company B
      const prodResB = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          name: 'Beta Secret Product',
          sellingPrice: 100,
          stockQuantity: 50
        });
      const prodBId = prodResB.body.data._id;

      // Company A tries to get Company B's product by ID
      const getResA = await request(app)
        .get(`/api/products/${prodBId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(getResA.statusCode).toBe(404);

      // Company A tries to search and get 0 results for Company B's product
      const searchResA = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(searchResA.body.data.length).toBe(0);
    });
  });

  describe('3. Products, Customers & Inventory Workflow', () => {
    it('should create product, customer, search, and manage stock', async () => {
      await setupCompaniesAndUsers();

      // Create Customer
      const custRes = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Tunisia Tech SARL',
          email: 'contact@tuntech.tn',
          taxId: '1234567/A/M/000',
          phone: '+21671000000'
        });
      expect(custRes.statusCode).toBe(201);
      const customerId = custRes.body.data._id;

      // Create Product
      const prodRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Thermal Receipt Printer',
          reference: 'PRN-001',
          barcode: '6191234567890',
          sellingPrice: 150.0,
          purchasePrice: 100.0,
          vatRate: 19,
          stockQuantity: 20
        });
      expect(prodRes.statusCode).toBe(201);
      const productId = prodRes.body.data._id;

      // Test Search
      const searchRes = await request(app)
        .get('/api/products/search?q=PRN-001')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(searchRes.body.data.length).toBe(1);
      expect(searchRes.body.data[0].name).toBe('Thermal Receipt Printer');
    });
  });

  describe('4. Complete Invoice Calculation, Finalization, Stock & Payment Workflow', () => {
    it('should calculate totals, finalize invoice, reduce stock, record payment, and generate PDF', async () => {
      await setupCompaniesAndUsers();

      // 1. Create Customer
      const custRes = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'SOCIETE ABC',
          companyName: 'ABC Distribution',
          email: 'abc@distribution.tn',
          taxId: '9876543/B/A/000'
        });
      const customerId = custRes.body.data._id;

      // 2. Create Products
      const p1 = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Product 1 (3.500 DT)',
          reference: 'P1',
          sellingPrice: 3.5,
          vatRate: 19,
          stockQuantity: 50
        });
      const prod1Id = p1.body.data._id;

      const p2 = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Product 2 (4.000 DT)',
          reference: 'P2',
          sellingPrice: 4.0,
          vatRate: 19,
          stockQuantity: 30
        });
      const prod2Id = p2.body.data._id;

      // 3. Create Draft Invoice
      // Item 1: 10 units x 3.5 = 35.000 HT, VAT (19%) = 6.650, TTC = 41.650
      // Item 2: 3 units x 4.0 = 12.000 HT, VAT (19%) = 2.280, TTC = 14.280
      // Subtotal HT = 47.000 HT, VAT Total = 8.930, Total TTC = 55.930 DT
      const invRes = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          customerId,
          dueDate: '2026-10-18',
          items: [
            { productId: prod1Id, quantity: 10, unitPrice: 3.5 },
            { productId: prod2Id, quantity: 3, unitPrice: 4.0 }
          ],
          discount: 0,
          paymentTerms: '30 days'
        });

      expect(invRes.statusCode).toBe(201);
      const invoice = invRes.body.data;
      expect(invoice.status).toBe('draft');
      expect(invoice.subtotalHT).toBe(47);
      expect(invoice.vatTotal).toBe(8.93);
      expect(invoice.totalTTC).toBe(55.93);
      expect(invoice.amountDue).toBe(55.93);

      const invoiceId = invoice._id;

      // 4. Finalize Invoice
      const finRes = await request(app)
        .post(`/api/invoices/${invoiceId}/finalize`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(finRes.statusCode).toBe(200);
      expect(finRes.body.data.status).toBe('finalized');
      expect(finRes.body.data.invoiceNumber).toMatch(/^INV-\d{4}-\d{6}$/);

      // 5. Verify Stock Reduction & Movement Log
      const checkP1 = await Product.findById(prod1Id);
      expect(checkP1.stockQuantity).toBe(40); // 50 - 10

      const checkP2 = await Product.findById(prod2Id);
      expect(checkP2.stockQuantity).toBe(27); // 30 - 3

      const movements = await StockMovement.find({ companyId: companyAId });
      expect(movements.length).toBe(2);

      // 6. Record Partial Payment (20.000 DT)
      const pay1Res = await request(app)
        .post(`/api/invoices/${invoiceId}/payments`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          amount: 20.0,
          paymentMethod: 'cash',
          reference: 'REC-001'
        });

      expect(pay1Res.statusCode).toBe(201);
      expect(pay1Res.body.data.invoice.paymentStatus).toBe('partially_paid');
      expect(pay1Res.body.data.invoice.amountPaid).toBe(20.0);
      expect(pay1Res.body.data.invoice.amountDue).toBe(35.93);

      // 7. Record Final Payment (35.930 DT)
      const pay2Res = await request(app)
        .post(`/api/invoices/${invoiceId}/payments`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          amount: 35.93,
          paymentMethod: 'bank_transfer',
          reference: 'TRF-998877'
        });

      expect(pay2Res.statusCode).toBe(201);
      expect(pay2Res.body.data.invoice.paymentStatus).toBe('paid');
      expect(pay2Res.body.data.invoice.amountDue).toBe(0);

      // 8. Generate & Verify PDF Endpoint
      const pdfRes = await request(app)
        .get(`/api/invoices/${invoiceId}/pdf`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(pdfRes.statusCode).toBe(200);
      expect(pdfRes.headers['content-type']).toBe('application/pdf');

      // 9. Dashboard Summary Verification
      const dashRes = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(dashRes.statusCode).toBe(200);
      expect(dashRes.body.data.todaySales).toBe(55.93);
      expect(dashRes.body.data.paidInvoices).toBe(1);
    });
  });
});
