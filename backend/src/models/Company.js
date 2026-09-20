const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    legalName: {
      type: String,
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    postalCode: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: 'Tunisia'
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      default: ''
    },
    taxId: {
      type: String, // Matricule Fiscal in Tunisia
      trim: true,
      default: ''
    },
    registrationNumber: {
      type: String, // Registre de Commerce
      trim: true,
      default: ''
    },
    bankName: {
      type: String,
      default: ''
    },
    bankAccount: {
      type: String, // RIB / IBAN
      default: ''
    },
    paymentTerms: {
      type: String,
      default: '30 days'
    },
    defaultCurrency: {
      type: String,
      default: 'TND'
    },
    defaultVatRate: {
      type: Number,
      default: 19
    },
    invoicePrefix: {
      type: String,
      default: 'INV'
    },
    nextInvoiceNumber: {
      type: Number,
      default: 1
    },
    invoiceTemplate: {
      type: String,
      enum: ['professional', 'modern', 'simple'],
      default: 'professional'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Company', companySchema);
