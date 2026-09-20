const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

/**
 * Deduct stock safely when an invoice is finalized
 */
const deductStockForInvoice = async (invoice, companyId, userId) => {
  const stockMovements = [];

  for (const item of invoice.items) {
    // 1. Retrieve current product to verify existence and log previous quantity
    const product = await Product.findOne({ _id: item.productId, companyId });
    if (!product) {
      throw new Error(`Product "${item.productName}" not found for this company`);
    }

    if (product.stockQuantity < item.quantity) {
      throw new Error(
        `Insufficient stock for product "${item.productName}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`
      );
    }

    const previousQuantity = product.stockQuantity;

    // 2. Atomic update to prevent race conditions
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: item.productId, companyId, stockQuantity: { $gte: item.quantity } },
      { $inc: { stockQuantity: -item.quantity } },
      { new: true }
    );

    if (!updatedProduct) {
      throw new Error(
        `Concurrent stock reduction conflict for product "${item.productName}". Please try again.`
      );
    }

    // 3. Record StockMovement
    const movement = await StockMovement.create({
      companyId,
      productId: item.productId,
      type: 'sale',
      quantity: item.quantity,
      previousQuantity,
      newQuantity: updatedProduct.stockQuantity,
      referenceType: 'Invoice',
      referenceId: invoice._id.toString(),
      createdBy: userId
    });

    stockMovements.push(movement);
  }

  return stockMovements;
};

/**
 * Restore stock if an invoice is cancelled
 */
const restoreStockForInvoice = async (invoice, companyId, userId) => {
  const stockMovements = [];

  for (const item of invoice.items) {
    const product = await Product.findOne({ _id: item.productId, companyId });
    if (!product) continue;

    const previousQuantity = product.stockQuantity;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: item.productId, companyId },
      { $inc: { stockQuantity: item.quantity } },
      { new: true }
    );

    const movement = await StockMovement.create({
      companyId,
      productId: item.productId,
      type: 'return',
      quantity: item.quantity,
      previousQuantity,
      newQuantity: updatedProduct.stockQuantity,
      referenceType: 'Invoice',
      referenceId: invoice._id.toString(),
      createdBy: userId
    });

    stockMovements.push(movement);
  }

  return stockMovements;
};

module.exports = {
  deductStockForInvoice,
  restoreStockForInvoice
};
