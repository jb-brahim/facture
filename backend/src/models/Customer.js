const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    companyName: {
      type: String,
      trim: true,
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
      lowercase: true,
      default: ''
    },
    taxId: {
      type: String, // Matricule Fiscal
      trim: true,
      default: ''
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: ''
    },
    paymentTerms: {
      type: String,
      default: '30 days'
    },
    notes: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

customerSchema.index({ companyId: 1, name: 1 });
customerSchema.index({ companyId: 1, email: 1 });
customerSchema.index({ companyId: 1, phone: 1 });
customerSchema.index({ companyId: 1, taxId: 1 });

module.exports = mongoose.model('Customer', customerSchema);
