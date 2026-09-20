const { body } = require('express-validator');

const updateCompanyValidator = [
  body('name').optional().notEmpty().withMessage('Company name cannot be empty').trim(),
  body('email').optional().isEmail().withMessage('Please provide a valid email address'),
  body('defaultVatRate').optional().isNumeric().withMessage('Default VAT rate must be a number'),
  body('invoicePrefix').optional().isString().trim(),
  body('invoiceTemplate').optional().isIn(['professional', 'modern', 'simple']).withMessage('Invalid template type')
];

module.exports = {
  updateCompanyValidator
};
