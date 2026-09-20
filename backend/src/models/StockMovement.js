const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['sale', 'purchase', 'adjustment', 'return'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousQuantity: {
      type: Number,
      required: true
    },
    newQuantity: {
      type: Number,
      required: true
    },
    referenceType: {
      type: String,
      enum: ['Invoice', 'Manual', 'Return'],
      default: 'Invoice'
    },
    referenceId: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

stockMovementSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
