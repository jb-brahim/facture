const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const { sendSuccess, sendError } = require('../utils/response');
const {
  createDraftInvoice,
  buildInvoiceData,
  finalizeInvoice,
  cancelInvoice
} = require('../services/invoiceService');
const { generateInvoicePDF } = require('../services/pdfService');

// @desc    Create draft invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res, next) => {
  try {
    const invoice = await createDraftInvoice(
      req.companyId,
      req.user._id,
      req.body
    );

    return sendSuccess(res, invoice, 'Draft invoice created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoices with filters & pagination
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = { companyId: req.companyId };

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.customerId) {
      query.customerId = req.query.customerId;
    }

    if (req.query.dateFrom || req.query.dateTo) {
      query.invoiceDate = {};
      if (req.query.dateFrom) query.invoiceDate.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) query.invoiceDate.$lte = new Date(req.query.dateTo);
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { invoiceNumber: searchRegex },
        { notes: searchRegex }
      ];
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('customerId', 'name companyName phone email taxId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    return sendSuccess(res, invoices, 'Invoices retrieved', 200, pagination);
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      companyId: req.companyId
    }).populate('customerId', 'name companyName address city postalCode country phone email taxId');

    if (!invoice) {
      return sendError(res, 'Invoice not found', 404);
    }

    return sendSuccess(res, invoice, 'Invoice details retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update draft invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = async (req, res, next) => {
  try {
    const existingInvoice = await Invoice.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!existingInvoice) {
      return sendError(res, 'Invoice not found', 404);
    }

    if (existingInvoice.status !== 'draft') {
      return sendError(
        res,
        `Cannot edit a ${existingInvoice.status} invoice. Finalized invoices are locked for accounting safety.`,
        400
      );
    }

    // Recalculate totals and snapshots if items or discounts are updated
    let updateFields = { ...req.body };
    if (req.body.items || req.body.customerId || req.body.discount !== undefined) {
      const payload = {
        customerId: req.body.customerId || existingInvoice.customerId,
        items: req.body.items || existingInvoice.items,
        discount: req.body.discount !== undefined ? req.body.discount : existingInvoice.discount,
        amountPaid: existingInvoice.amountPaid
      };

      const { calculated } = await buildInvoiceData(req.companyId, payload);
      updateFields = {
        ...updateFields,
        items: calculated.items,
        subtotalHT: calculated.subtotalHT,
        discount: calculated.discount,
        totalHT: calculated.totalHT,
        vatTotal: calculated.vatTotal,
        totalTTC: calculated.totalTTC,
        amountDue: calculated.amountDue
      };
    }

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, updatedInvoice, 'Invoice updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Finalize draft invoice
// @route   POST /api/invoices/:id/finalize
// @access  Private
const finalizeInvoiceController = async (req, res, next) => {
  try {
    const invoice = await finalizeInvoice(
      req.params.id,
      req.companyId,
      req.user._id
    );

    return sendSuccess(res, invoice, 'Invoice finalized and stock updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel invoice
// @route   POST /api/invoices/:id/cancel
// @access  Private
const cancelInvoiceController = async (req, res, next) => {
  try {
    const invoice = await cancelInvoice(
      req.params.id,
      req.companyId,
      req.user._id
    );

    return sendSuccess(res, invoice, 'Invoice cancelled successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Stream / Download Invoice PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
const getInvoicePDF = async (req, res, next) => {
  try {
    const pdfDoc = await generateInvoicePDF(req.params.id, req.companyId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="invoice-${req.params.id}.pdf"`
    );

    pdfDoc.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history for an invoice
// @route   GET /api/invoices/:id/payments
// @access  Private
const getInvoicePayments = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!invoice) {
      return sendError(res, 'Invoice not found', 404);
    }

    const payments = await Payment.find({
      invoiceId: req.params.id,
      companyId: req.companyId
    }).sort({ paymentDate: -1 });

    return sendSuccess(res, payments, 'Invoice payments retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete draft invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, companyId: req.companyId });
    if (!invoice) {
      return sendError(res, 'Invoice not found', 404);
    }

    if (invoice.status !== 'draft') {
      return sendError(res, 'Only draft invoices can be deleted. Finalized invoices should be cancelled.', 400);
    }

    await Invoice.deleteOne({ _id: req.params.id, companyId: req.companyId });
    return sendSuccess(res, null, 'Draft invoice deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  finalizeInvoiceController,
  cancelInvoiceController,
  getInvoicePDF,
  getInvoicePayments,
  deleteInvoice
};
