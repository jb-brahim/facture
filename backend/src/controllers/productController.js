const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      companyId: req.companyId
    });

    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (with pagination & filtering)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = { companyId: req.companyId, isActive: true };

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { reference: searchRegex },
        { barcode: searchRegex },
        { category: searchRegex }
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    return sendSuccess(res, products, 'Products retrieved', 200, pagination);
  } catch (error) {
    next(error);
  }
};

// @desc    Search products by name, SKU, or barcode
// @route   GET /api/products/search?q=
// @access  Private
const searchProducts = async (req, res, next) => {
  try {
    const search = req.query.q || '';
    const searchRegex = new RegExp(search, 'i');

    const query = {
      companyId: req.companyId,
      isActive: true,
      $or: [
        { name: searchRegex },
        { reference: searchRegex },
        { barcode: searchRegex }
      ]
    };

    const products = await Product.find(query).limit(10);
    return sendSuccess(res, products, 'Product search results');
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    return sendSuccess(res, product, 'Product retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    return sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    return sendSuccess(res, null, 'Product deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
