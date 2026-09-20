const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  searchCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const {
  createCustomerValidator,
  updateCustomerValidator
} = require('../validators/customerValidators');

router.use(protect);

router.post('/', validate(createCustomerValidator), createCustomer);
router.get('/', getCustomers);
router.get('/search', searchCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', validate(updateCustomerValidator), updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;
