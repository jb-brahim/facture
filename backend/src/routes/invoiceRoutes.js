const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  finalizeInvoiceController,
  cancelInvoiceController,
  getInvoicePDF,
  getInvoicePayments,
  deleteInvoice
} = require('../controllers/invoiceController');
const { createPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const {
  createInvoiceValidator,
  updateInvoiceValidator
} = require('../validators/invoiceValidators');
const { createPaymentValidator } = require('../validators/paymentValidators');

router.use(protect);

router.post('/', validate(createInvoiceValidator), createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', validate(updateInvoiceValidator), updateInvoice);
router.delete('/:id', deleteInvoice);

router.post('/:id/finalize', finalizeInvoiceController);
router.post('/:id/cancel', cancelInvoiceController);
router.get('/:id/pdf', getInvoicePDF);
router.get('/:id/payments', getInvoicePayments);

// Embedded payments route
router.post('/:invoiceId/payments', validate(createPaymentValidator), createPayment);

module.exports = router;
