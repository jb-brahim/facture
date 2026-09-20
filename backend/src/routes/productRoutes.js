const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const {
  createProductValidator,
  updateProductValidator
} = require('../validators/productValidators');

router.use(protect);

router.post('/', validate(createProductValidator), createProduct);
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.put('/:id', validate(updateProductValidator), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
