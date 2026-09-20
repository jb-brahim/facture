/**
 * Safe Financial Calculations for Invoicing
 */

// Round safely to specified decimals (default 3 for TND, or 2 for general currencies)
const roundDecimals = (num, decimals = 3) => {
  const factor = Math.pow(10, decimals);
  return Math.round((Number(num) + Number.EPSILON) * factor) / factor;
};

const calculateItemTotals = (item, currency = 'TND') => {
  const decimals = currency === 'TND' ? 3 : 2;
  const quantity = Number(item.quantity) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  const itemDiscount = Number(item.discount) || 0;
  const vatRate = Number(item.vatRate) || 0;

  const rawLineHT = quantity * unitPrice - itemDiscount;
  const lineHT = roundDecimals(rawLineHT > 0 ? rawLineHT : 0, decimals);
  const vatAmount = roundDecimals((lineHT * vatRate) / 100, decimals);
  const totalTTC = roundDecimals(lineHT + vatAmount, decimals);

  return {
    lineHT,
    vatAmount,
    totalTTC
  };
};

const calculateInvoiceTotals = (items = [], invoiceDiscount = 0, amountPaid = 0, currency = 'TND') => {
  const decimals = currency === 'TND' ? 3 : 2;

  let subtotalHT = 0;
  let vatTotal = 0;

  const processedItems = items.map(item => {
    const itemCalculations = calculateItemTotals(item, currency);
    subtotalHT += itemCalculations.lineHT;
    vatTotal += itemCalculations.vatAmount;

    return {
      ...item,
      lineHT: itemCalculations.lineHT,
      vatAmount: itemCalculations.vatAmount,
      totalTTC: itemCalculations.totalTTC
    };
  });

  subtotalHT = roundDecimals(subtotalHT, decimals);
  vatTotal = roundDecimals(vatTotal, decimals);
  
  const discountVal = Number(invoiceDiscount) || 0;
  const totalHT = roundDecimals(Math.max(0, subtotalHT - discountVal), decimals);
  const totalTTC = roundDecimals(totalHT + vatTotal, decimals);
  const paidVal = Number(amountPaid) || 0;
  const amountDue = roundDecimals(Math.max(0, totalTTC - paidVal), decimals);

  return {
    items: processedItems,
    subtotalHT,
    discount: discountVal,
    totalHT,
    vatTotal,
    totalTTC,
    amountPaid: paidVal,
    amountDue
  };
};

module.exports = {
  roundDecimals,
  calculateItemTotals,
  calculateInvoiceTotals
};
