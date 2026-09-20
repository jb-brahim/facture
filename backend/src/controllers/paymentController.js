const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { sendSuccess, sendError } = require('../utils/response');
const { syncInvoicePaymentStatus } = require('../services/paymentService');

// @desc    Record payment for an invoice
// @route   POST /api/invoices/:invoiceId/payments
// @access  Private
const createPayment = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const { amount, paymentDate, paymentMethod, reference, notes } = req.body;

    const invoice = await Invoice.findOne({ _id: invoiceId, companyId: req.companyId });
    if (!invoice) {
      return sendError(res, 'Invoice not found', 404);
    }

    if (invoice.status === 'cancelled') {
      return sendError(res, 'Cannot record payment for a cancelled invoice', 400);
    }

    const numericAmount = Number(amount);
    if (numericAmount <= 0) {
      return sendError(res, 'Payment amount must be greater than zero', 400);
    }

    // Overpayment check
    if (numericAmount > invoice.amountDue + 0.001) {
      return sendError(
        res,
        `Payment amount (${numericAmount}) exceeds remaining invoice balance (${invoice.amountDue})`,
        400
      );
    }

    // 1. Save payment record
    const payment = await Payment.create({
      companyId: req.companyId,
      invoiceId,
      amount: numericAmount,
      paymentDate: paymentDate || new Date(),
      paymentMethod: paymentMethod || 'bank_transfer',
      reference: reference || '',
      notes: notes || '',
      createdBy: req.user._id
    });

    // 2. Synchronize invoice payment status and amounts
    const updatedInvoice = await syncInvoicePaymentStatus(invoiceId, req.companyId);

    return sendSuccess(
      res,
      { payment, invoice: updatedInvoice },
      'Payment recorded and invoice updated successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment
};
