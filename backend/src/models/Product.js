const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    reference: {
      type: String, // SKU
      trim: true,
      default: ''
    },
    barcode: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: 'General'
    },
    purchasePrice: {
      type: Number,
      default: 0,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0
    },
    vatRate: {
      type: Number,
      default: 19,
      min: 0
    },
    stockQuantity: {
      type: Number,
      default: 0
    },
    minStockLevel: {
      type: Number,
      default: 5
    },
    unit: {
      type: String,
      default: 'unit'
    },
    originCountry: {
      type: String,
      default: 'USA',
      trim: true
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

productSchema.index({ companyId: 1, name: 1 });
productSchema.index({ companyId: 1, reference: 1 });
productSchema.index({ companyId: 1, barcode: 1 });

module.exports = mongoose.model('Product', productSchema);
