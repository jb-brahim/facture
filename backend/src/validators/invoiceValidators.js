const { body } = require('express-validator');

const createInvoiceValidator = [
  body('customerId').isMongoId().withMessage('Valid customer ID is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('items').isArray({ min: 1 }).withMessage('Invoice must contain at least one item'),
  body('items.*.productId').isMongoId().withMessage('Valid product ID is required for each item'),
  body('items.*.quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be greater than zero'),
  body('items.*.unitPrice').optional().isFloat({ min: 0 }).withMessage('Unit price must be non-negative'),
  body('items.*.discount').optional().isFloat({ min: 0 }).withMessage('Item discount must be non-negative'),
  body('items.*.vatRate').optional().isFloat({ min: 0 }).withMessage('VAT rate must be non-negative'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('Invoice discount must be non-negative'),
  body('notes').optional().trim(),
  body('paymentTerms').optional().trim(),
  body('paymentMethod').optional().trim()
];

const updateInvoiceValidator = [
  body('customerId').optional().isMongoId().withMessage('Valid customer ID is required'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
  body('items').optional().isArray({ min: 1 }).withMessage('Invoice must contain at least one item'),
  body('items.*.productId').optional().isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').optional().isFloat({ min: 0.001 }).withMessage('Quantity must be greater than zero'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('Invoice discount must be non-negative')
];

module.exports = {
  createInvoiceValidator,
  updateInvoiceValidator
};
