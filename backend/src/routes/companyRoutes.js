const express = require('express');
const router = express.Router();
const { getCompany, updateCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validationMiddleware');
const { updateCompanyValidator } = require('../validators/companyValidators');

router.use(protect);

router.get('/', getCompany);
router.put('/', authorize('owner', 'admin'), validate(updateCompanyValidator), updateCompany);

module.exports = router;
