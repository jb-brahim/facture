const { body } = require('express-validator');

const createProductValidator = [
  body('name').notEmpty().withMessage('Product name is required').trim(),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a non-negative number'),
  body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('Purchase price must be a non-negative number'),
  body('vatRate').optional().isFloat({ min: 0 }).withMessage('VAT rate must be a non-negative number'),
  body('stockQuantity').optional().isFloat().withMessage('Stock quantity must be a number'),
  body('minStockLevel').optional().isFloat({ min: 0 }).withMessage('Min stock level must be a non-negative number'),
  body('reference').optional().trim(),
  body('barcode').optional().trim()
];

const updateProductValidator = [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty').trim(),
  body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('Selling price must be a non-negative number'),
  body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('Purchase price must be a non-negative number'),
  body('vatRate').optional().isFloat({ min: 0 }).withMessage('VAT rate must be a non-negative number'),
  body('stockQuantity').optional().isFloat().withMessage('Stock quantity must be a number'),
  body('minStockLevel').optional().isFloat({ min: 0 }).withMessage('Min stock level must be a non-negative number')
];

module.exports = {
  createProductValidator,
  updateProductValidator
};
