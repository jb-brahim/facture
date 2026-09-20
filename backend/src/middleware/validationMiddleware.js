const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return sendError(res, 'Validation Failed', 400, formattedErrors);
  };
};

module.exports = validate;
