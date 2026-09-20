const { body } = require('express-validator');

const createCustomerValidator = [
  body('name').notEmpty().withMessage('Customer name is required').trim(),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Please provide a valid email'),
  body('companyName').optional().trim(),
  body('phone').optional().trim(),
  body('taxId').optional().trim(),
  body('registrationNumber').optional().trim()
];

const updateCustomerValidator = [
  body('name').optional().notEmpty().withMessage('Customer name cannot be empty').trim(),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Please provide a valid email'),
  body('companyName').optional().trim(),
  body('phone').optional().trim(),
  body('taxId').optional().trim()
];

module.exports = {
  createCustomerValidator,
  updateCustomerValidator
};
