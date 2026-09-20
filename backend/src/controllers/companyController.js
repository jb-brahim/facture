const Company = require('../models/Company');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get company profile
// @route   GET /api/company
// @access  Private
const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.companyId);
    if (!company) {
      return sendError(res, 'Company profile not found', 44);
    }
    return sendSuccess(res, company, 'Company profile retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update company profile
// @route   PUT /api/company
// @access  Private (Owner/Admin)
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.companyId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!company) {
      return sendError(res, 'Company profile not found', 404);
    }

    return sendSuccess(res, company, 'Company profile updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompany,
  updateCompany
};
