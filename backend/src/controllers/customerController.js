const Customer = require('../models/Customer');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      companyId: req.companyId
    });

    return sendSuccess(res, customer, 'Customer created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers (with pagination & filtering)
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = { companyId: req.companyId, isActive: true };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { companyName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { taxId: searchRegex }
      ];
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    return sendSuccess(res, customers, 'Customers retrieved', 200, pagination);
  } catch (error) {
    next(error);
  }
};

// @desc    Search customers fast
// @route   GET /api/customers/search?q=
// @access  Private
const searchCustomers = async (req, res, next) => {
  try {
    const search = req.query.q || '';
    const searchRegex = new RegExp(search, 'i');

    const query = {
      companyId: req.companyId,
      isActive: true,
      $or: [
        { name: searchRegex },
        { companyName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { taxId: searchRegex }
      ]
    };

    const customers = await Customer.find(query).limit(10);
    return sendSuccess(res, customers, 'Customer search results');
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!customer) {
      return sendError(res, 'Customer not found', 404);
    }

    return sendSuccess(res, customer, 'Customer retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return sendError(res, 'Customer not found', 404);
    }

    return sendSuccess(res, customer, 'Customer updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!customer) {
      return sendError(res, 'Customer not found', 404);
    }

    return sendSuccess(res, null, 'Customer deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  searchCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
