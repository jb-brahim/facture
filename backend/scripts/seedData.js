const mongoose = require('mongoose');
const env = require('../src/config/env');
const Company = require('../src/models/Company');
const Product = require('../src/models/Product');
const Customer = require('../src/models/Customer');

async function seed() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    const companies = await Company.find();
    console.log(`Found ${companies.length} company workspace(s)`);

    for (const c of companies) {
      const products = [
        {
          companyId: c._id,
          name: 'MacBook Pro 16" M3 Max',
          reference: 'SKU-MBP16-01',
          originCountry: 'USA',
          sellingPrice: 9850.000,
          purchasePrice: 8200.000,
          vatRate: 19,
          stockQuantity: 15,
          unit: 'pcs',
          category: 'Electronics'
        },
        {
          companyId: c._id,
          name: 'Sony Bravia XR 65" OLED 4K Cinema Display',
          reference: 'SKU-SONY-65OLED',
          originCountry: 'Japan',
          sellingPrice: 6200.000,
          purchasePrice: 4800.000,
          vatRate: 19,
          stockQuantity: 10,
          unit: 'pcs',
          category: 'Electronics'
        },
        {
          companyId: c._id,
          name: 'Canon EOS R5 C Mirrorless Cinema Camera',
          reference: 'SKU-CANON-R5C',
          originCountry: 'Japan',
          sellingPrice: 13500.000,
          purchasePrice: 11000.000,
          vatRate: 19,
          stockQuantity: 6,
          unit: 'pcs',
          category: 'Photography'
        },
        {
          companyId: c._id,
          name: 'Dell UltraSharp 32" 4K Monitor',
          reference: 'SKU-DELL32-4K',
          originCountry: 'USA',
          sellingPrice: 2450.500,
          purchasePrice: 1900.000,
          vatRate: 19,
          stockQuantity: 28,
          unit: 'pcs',
          category: 'Hardware'
        },
        {
          companyId: c._id,
          name: 'Makita LXT 18V Brushless Drill Suite',
          reference: 'SKU-MAKITA-18V',
          originCountry: 'Japan',
          sellingPrice: 1150.000,
          purchasePrice: 850.000,
          vatRate: 19,
          stockQuantity: 20,
          unit: 'pcs',
          category: 'Tools & Equipment'
        },
        {
          companyId: c._id,
          name: 'Bosch Professional Industrial Sensor Kit',
          reference: 'SKU-BOSCH-SENS',
          originCountry: 'Germany',
          sellingPrice: 1850.000,
          purchasePrice: 1350.000,
          vatRate: 19,
          stockQuantity: 15,
          unit: 'kit',
          category: 'Industrial'
        },
        {
          companyId: c._id,
          name: 'Logitech MX Master 3S Mouse',
          reference: 'SKU-MX3S-01',
          originCountry: 'USA',
          sellingPrice: 380.000,
          purchasePrice: 280.000,
          vatRate: 19,
          stockQuantity: 50,
          unit: 'pcs',
          category: 'Accessories'
        },
        {
          companyId: c._id,
          name: 'Cisco Gigabit Managed Switch 24-Port',
          reference: 'SKU-CS-24P-01',
          originCountry: 'USA',
          sellingPrice: 3200.000,
          purchasePrice: 2500.000,
          vatRate: 19,
          stockQuantity: 8,
          unit: 'pcs',
          category: 'Networking'
        }
      ];

      const customers = [
        {
          companyId: c._id,
          name: 'Karim Ben Salem',
          companyName: 'Atlas Tech Solutions SARL',
          email: 'karim@atlastech.tn',
          phone: '+216 71 888 999',
          taxId: '1234567/A/M/000',
          address: 'Les Berges du Lac 2, Tunis'
        },
        {
          companyId: c._id,
          name: 'Sonia Mansour',
          companyName: 'Mediterranean Logistics SA',
          email: 's.mansour@medlog.tn',
          phone: '+216 73 444 555',
          taxId: '7654321/B/P/000',
          address: 'Zone Industrielle, Sousse'
        },
        {
          companyId: c._id,
          name: 'Mohamed Dridi',
          companyName: 'Smart Commerce Consulting',
          email: 'mdridi@smartcommerce.com',
          phone: '+216 74 111 222',
          taxId: '9876543/C/A/000',
          address: 'Route de Teniour, Sfax'
        }
      ];

      for (const p of products) {
        await Product.updateOne({ companyId: c._id, reference: p.reference }, p, { upsert: true });
      }
      for (const cust of customers) {
        await Customer.updateOne({ companyId: c._id, email: cust.email }, cust, { upsert: true });
      }
      console.log(`Seeded ${products.length} products with origins & 3 customers for company: ${c.name} (${c._id})`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
