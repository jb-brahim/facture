const Counter = require('../models/Counter');
const Company = require('../models/Company');

/**
 * Generate unique, sequential invoice number per company
 * Format: {PREFIX}-{YEAR}-{SEQUENCE:000000} (e.g., INV-2026-000001)
 */
const generateInvoiceNumber = async (companyId, customPrefix = null) => {
  const year = new Date().getFullYear();
  
  // Find prefix from company settings if not provided
  let prefix = customPrefix;
  if (!prefix) {
    const company = await Company.findById(companyId);
    prefix = company?.invoicePrefix || 'INV';
  }

  // Atomically increment counter for (companyId, year)
  const counter = await Counter.findOneAndUpdate(
    { companyId, year },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const formattedSeq = String(counter.seq).padStart(6, '0');
  return `${prefix}-${year}-${formattedSeq}`;
};

module.exports = {
  generateInvoiceNumber
};
