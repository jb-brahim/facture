const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getSalesByCustomerReport,
  getSalesByProductReport,
  getVatReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/sales', getSalesReport);
router.get('/by-customer', getSalesByCustomerReport);
router.get('/by-product', getSalesByProductReport);
router.get('/vat', getVatReport);

module.exports = router;
