const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const { sendSuccess } = require('../utils/response');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const companyId = req.companyId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 1. Today's Sales (Finalized invoices)
    const todaySalesAgg = await Invoice.aggregate([
      {
        $match: {
          companyId,
          status: 'finalized',
          invoiceDate: { $gte: startOfToday }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalTTC' } } }
    ]);
    const todaySales = todaySalesAgg[0]?.total || 0;

    // 2. Month's Sales
    const monthSalesAgg = await Invoice.aggregate([
      {
        $match: {
          companyId,
          status: 'finalized',
          invoiceDate: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalTTC' } } }
    ]);
    const currentMonthSales = monthSalesAgg[0]?.total || 0;

    // 3. Invoice status counts
    const totalInvoices = await Invoice.countDocuments({ companyId });
    const paidInvoices = await Invoice.countDocuments({ companyId, paymentStatus: 'paid' });
    const unpaidInvoices = await Invoice.countDocuments({ companyId, paymentStatus: 'unpaid' });
    const overdueInvoices = await Invoice.countDocuments({ companyId, paymentStatus: 'overdue' });

    // 4. Financial totals (Outstanding amount & Total VAT)
    const financialTotalsAgg = await Invoice.aggregate([
      {
        $match: {
          companyId,
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalOutstanding: { $sum: '$amountDue' },
          totalVat: { $sum: '$vatTotal' }
        }
      }
    ]);

    const totalOutstanding = financialTotalsAgg[0]?.totalOutstanding || 0;
    const totalVat = financialTotalsAgg[0]?.totalVat || 0;

    // 5. Low Stock Products
    const lowStockProducts = await Product.find({
      companyId,
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
    }).select('name reference stockQuantity minStockLevel unit');

    return sendSuccess(res, {
      todaySales,
      currentMonthSales,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
      totalOutstanding,
      totalVat,
      lowStockCount: lowStockProducts.length,
      lowStockProducts
    }, 'Dashboard summary retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};
