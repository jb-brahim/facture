const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { roundDecimals } = require('../utils/calculations');

/**
 * Recalculate invoice payment status from recorded payments
 */
const syncInvoicePaymentStatus = async (invoiceId, companyId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, companyId });
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Aggregate all payments for this invoice
  const payments = await Payment.find({ invoiceId, companyId });
  const totalPaidRaw = payments.reduce((sum, p) => sum + p.amount, 0);
  const amountPaid = roundDecimals(totalPaidRaw, invoice.currency === 'TND' ? 3 : 2);
  const amountDue = roundDecimals(Math.max(0, invoice.totalTTC - amountPaid), invoice.currency === 'TND' ? 3 : 2);

  let paymentStatus = 'unpaid';

  if (amountPaid === 0) {
    paymentStatus = 'unpaid';
  } else if (amountPaid < invoice.totalTTC) {
    paymentStatus = 'partially_paid';
  } else {
    paymentStatus = 'paid';
  }

  // Check overdue condition
  const now = new Date();
  if (paymentStatus !== 'paid' && invoice.dueDate && new Date(invoice.dueDate) < now && amountDue > 0) {
    paymentStatus = 'overdue';
  }

  invoice.amountPaid = amountPaid;
  invoice.amountDue = amountDue;
  invoice.paymentStatus = paymentStatus;
  await invoice.save();

  return invoice;
};

module.exports = {
  syncInvoicePaymentStatus
};
