const PDFDocument = require('pdfkit');
const Company = require('../models/Company');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const renderProfessionalPDF = require('../utils/pdfTemplates/professional');
const renderModernPDF = require('../utils/pdfTemplates/modern');
const renderSimplePDF = require('../utils/pdfTemplates/simple');

/**
 * Generate PDF buffer / stream for invoice
 */
const generateInvoicePDF = async (invoiceId, companyId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, companyId });
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const company = await Company.findById(companyId);
  const customer = await Customer.findOne({ _id: invoice.customerId, companyId });

  if (!company || !customer) {
    throw new Error('Company or Customer records missing for this invoice');
  }

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  const templateType = company.invoiceTemplate || 'professional';

  const data = { company, customer, invoice };

  switch (templateType) {
    case 'modern':
      renderModernPDF(doc, data);
      break;
    case 'simple':
      renderSimplePDF(doc, data);
      break;
    case 'professional':
    default:
      renderProfessionalPDF(doc, data);
      break;
  }

  doc.end();
  return doc;
};

module.exports = {
  generateInvoicePDF
};
