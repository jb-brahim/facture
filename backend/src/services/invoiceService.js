const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Company = require('../models/Company');
const { calculateInvoiceTotals } = require('../utils/calculations');
const { generateInvoiceNumber } = require('../utils/invoiceNumber');
const { deductStockForInvoice, restoreStockForInvoice } = require('./stockService');

/**
 * Build invoice item snapshot & calculate totals
 */
const buildInvoiceData = async (companyId, invoiceData) => {
  // 1. Verify Customer
  const customer = await Customer.findOne({ _id: invoiceData.customerId, companyId });
  if (!customer) {
    throw new Error('Customer not found or does not belong to your company');
  }

  // 2. Fetch Company currency
  const company = await Company.findById(companyId);
  const currency = company?.defaultCurrency || 'TND';

  const applyVat = invoiceData.applyVat !== undefined ? Boolean(invoiceData.applyVat) : true;

  // 3. Build snapshot for items
  const itemSnapshots = [];
  for (const itemInput of invoiceData.items) {
    const product = await Product.findOne({ _id: itemInput.productId, companyId });
    if (!product) {
      throw new Error(`Product with ID ${itemInput.productId} not found for your company`);
    }

    const unitPrice = itemInput.unitPrice !== undefined ? itemInput.unitPrice : product.sellingPrice;
    const rawVatRate = itemInput.vatRate !== undefined ? itemInput.vatRate : product.vatRate;
    const vatRate = applyVat ? Number(rawVatRate) : 0;

    itemSnapshots.push({
      productId: product._id,
      productName: product.name,
      reference: product.reference || '',
      originCountry: product.originCountry || itemInput.originCountry || 'USA',
      description: itemInput.description || product.description || '',
      quantity: Number(itemInput.quantity),
      unitPrice: Number(unitPrice),
      vatRate,
      discount: Number(itemInput.discount || 0)
    });
  }

  // 4. Calculate Server-Side Totals
  const calculated = calculateInvoiceTotals(
    itemSnapshots,
    invoiceData.discount || 0,
    invoiceData.amountPaid || 0,
    currency
  );

  return {
    customer,
    currency,
    applyVat,
    calculated
  };
};

/**
 * Create a new Draft Invoice
 */
const createDraftInvoice = async (companyId, userId, invoiceInput) => {
  const { currency, applyVat, calculated } = await buildInvoiceData(companyId, invoiceInput);

  const invoice = new Invoice({
    companyId,
    customerId: invoiceInput.customerId,
    invoiceDate: invoiceInput.invoiceDate || new Date(),
    dueDate: invoiceInput.dueDate,
    status: 'draft',
    paymentStatus: 'unpaid',
    currency,
    applyVat,
    items: calculated.items,
    subtotalHT: calculated.subtotalHT,
    discount: calculated.discount,
    totalHT: calculated.totalHT,
    vatTotal: calculated.vatTotal,
    totalTTC: calculated.totalTTC,
    amountPaid: 0,
    amountDue: calculated.totalTTC,
    paymentTerms: invoiceInput.paymentTerms || '30 days',
    paymentMethod: invoiceInput.paymentMethod || 'bank_transfer',
    notes: invoiceInput.notes || '',
    createdBy: userId
  });

  await invoice.save();
  return invoice;
};

/**
 * Finalize an invoice (Assign invoice number, reduce stock)
 */
const finalizeInvoice = async (invoiceId, companyId, userId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, companyId });
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.status === 'finalized') {
    throw new Error('Invoice is already finalized');
  }

  if (invoice.status === 'cancelled') {
    throw new Error('Cannot finalize a cancelled invoice');
  }

  // Generate safe atomic invoice number if not already present
  if (!invoice.invoiceNumber) {
    invoice.invoiceNumber = await generateInvoiceNumber(companyId);
  }

  // Safe atomic stock deduction
  await deductStockForInvoice(invoice, companyId, userId);

  invoice.status = 'finalized';
  await invoice.save();

  return invoice;
};

/**
 * Cancel an invoice (Restore stock if finalized)
 */
const cancelInvoice = async (invoiceId, companyId, userId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, companyId });
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.status === 'cancelled') {
    throw new Error('Invoice is already cancelled');
  }

  if (invoice.status === 'finalized') {
    await restoreStockForInvoice(invoice, companyId, userId);
  }

  invoice.status = 'cancelled';
  await invoice.save();

  return invoice;
};

module.exports = {
  buildInvoiceData,
  createDraftInvoice,
  finalizeInvoice,
  cancelInvoice
};
