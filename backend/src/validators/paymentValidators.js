const { body } = require('express-validator');

const createPaymentValidator = [
  body('amount').isFloat({ min: 0.001 }).withMessage('Payment amount must be greater than zero'),
  body('paymentDate').optional().isISO8601().withMessage('Valid payment date is required'),
  body('paymentMethod').optional().isIn(['cash', 'bank_transfer', 'cheque', 'card', 'other']).withMessage('Invalid payment method'),
  body('reference').optional().trim(),
  body('notes').optional().trim()
];

module.exports = {
  createPaymentValidator
};
