const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  originCountry: {
    type: String,
    default: 'USA'
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.001, 'Quantity must be greater than zero']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  },
  vatRate: {
    type: Number,
    default: 19
  },
  discount: {
    type: Number,
    default: 0
  },
  lineHT: {
    type: Number,
    required: true
  },
  vatAmount: {
    type: Number,
    required: true
  },
  totalTTC: {
    type: Number,
    required: true
  }
});

const invoiceSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    invoiceNumber: {
      type: String,
      trim: true
    },
    invoiceDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'finalized', 'cancelled'],
      default: 'draft'
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'overdue'],
      default: 'unpaid'
    },
    currency: {
      type: String,
      default: 'TND'
    },
    applyVat: {
      type: Boolean,
      default: true
    },
    items: [invoiceItemSchema],
    subtotalHT: {
      type: Number,
      required: true,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalHT: {
      type: Number,
      required: true,
      default: 0
    },
    vatTotal: {
      type: Number,
      required: true,
      default: 0
    },
    totalTTC: {
      type: Number,
      required: true,
      default: 0
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    amountDue: {
      type: Number,
      required: true,
      default: 0
    },
    paymentTerms: {
      type: String,
      default: '30 days'
    },
    paymentMethod: {
      type: String,
      default: 'bank_transfer'
    },
    notes: {
      type: String,
      default: ''
    },
    pdfUrl: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

invoiceSchema.index({ companyId: 1, invoiceNumber: 1 });
invoiceSchema.index({ companyId: 1, invoiceDate: -1 });
invoiceSchema.index({ companyId: 1, paymentStatus: 1 });
invoiceSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
