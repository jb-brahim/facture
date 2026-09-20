const Invoice = require('../models/Invoice');
const { sendSuccess } = require('../utils/response');

// Helper date range builder
const getDateRangeQuery = (companyId, dateFrom, dateTo) => {
  const query = { companyId, status: 'finalized' };
  if (dateFrom || dateTo) {
    query.invoiceDate = {};
    if (dateFrom) query.invoiceDate.$gte = new Date(dateFrom);
    if (dateTo) query.invoiceDate.$lte = new Date(dateTo);
  }
  return query;
};

// @desc    Get Sales by Date range
// @route   GET /api/reports/sales
// @access  Private
const getSalesReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const matchQuery = getDateRangeQuery(req.companyId, dateFrom, dateTo);

    const report = await Invoice.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$invoiceDate' } },
          totalSalesHT: { $sum: '$totalHT' },
          totalVat: { $sum: '$vatTotal' },
          totalSalesTTC: { $sum: '$totalTTC' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return sendSuccess(res, report, 'Sales report by date retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get Sales breakdown by Customer
// @route   GET /api/reports/by-customer
// @access  Private
const getSalesByCustomerReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const matchQuery = getDateRangeQuery(req.companyId, dateFrom, dateTo);

    const report = await Invoice.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$customerId',
          totalSalesHT: { $sum: '$totalHT' },
          totalSalesTTC: { $sum: '$totalTTC' },
          invoiceCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $project: {
          _id: 1,
          customerName: '$customer.name',
          companyName: '$customer.companyName',
          totalSalesHT: 1,
          totalSalesTTC: 1,
          invoiceCount: 1
        }
      },
      { $sort: { totalSalesTTC: -1 } }
    ]);

    return sendSuccess(res, report, 'Sales by customer report retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get Sales breakdown by Product
// @route   GET /api/reports/by-product
// @access  Private
const getSalesByProductReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const matchQuery = getDateRangeQuery(req.companyId, dateFrom, dateTo);

    const report = await Invoice.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          reference: { $first: '$items.reference' },
          totalQuantity: { $sum: '$items.quantity' },
          totalSalesHT: { $sum: '$items.lineHT' },
          totalVat: { $sum: '$items.vatAmount' },
          totalSalesTTC: { $sum: '$items.totalTTC' }
        }
      },
      { $sort: { totalSalesTTC: -1 } }
    ]);

    return sendSuccess(res, report, 'Sales by product report retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get VAT Totals report
// @route   GET /api/reports/vat
// @access  Private
const getVatReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const matchQuery = getDateRangeQuery(req.companyId, dateFrom, dateTo);

    const report = await Invoice.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.vatRate',
          taxableAmountHT: { $sum: '$items.lineHT' },
          vatAmount: { $sum: '$items.vatAmount' },
          totalTTC: { $sum: '$items.totalTTC' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return sendSuccess(res, report, 'VAT report retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesReport,
  getSalesByCustomerReport,
  getSalesByProductReport,
  getVatReport
};
