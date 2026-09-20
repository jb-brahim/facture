const renderSimplePDF = (doc, data) => {
  const { company, customer, invoice } = data;
  const currency = invoice.currency || 'TND';

  doc.fillColor('#000000').fontSize(16).text(company.name, 50, 40);
  doc.fontSize(9).text(company.address || '', 50, 60);

  doc.fontSize(14).text(`INVOICE: ${invoice.invoiceNumber || 'DRAFT'}`, 350, 40, { align: 'right' });
  doc.fontSize(9).text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 350, 60, { align: 'right' });

  doc.moveTo(50, 85).lineTo(550, 85).stroke();

  doc.fontSize(10).text(`Customer: ${customer.name}`, 50, 100);

  let y = 140;
  doc.fontSize(9)
     .text('Item', 50, y, { width: 180 })
     .text('Origin', 235, y, { width: 55, align: 'center' })
     .text('Qty', 295, y, { width: 40, align: 'right' })
     .text('Price', 340, y, { width: 65, align: 'right' })
     .text('Total', 410, y, { width: 110, align: 'right' });

  y += 15;
  doc.moveTo(50, y).lineTo(550, y).stroke();
  y += 10;

  invoice.items.forEach(item => {
    doc.text(item.productName, 50, y, { width: 180 })
       .text(item.originCountry || 'USA', 235, y, { width: 55, align: 'center' })
       .text(item.quantity.toString(), 295, y, { width: 40, align: 'right' })
       .text(item.unitPrice.toFixed(3), 340, y, { width: 65, align: 'right' })
       .text(`${item.lineHT.toFixed(3)} ${currency}`, 410, y, { width: 110, align: 'right' });
    y += 18;
  });

  y += 15;
  doc.moveTo(50, y).lineTo(550, y).stroke();
  y += 15;

  doc.text(`Total TTC: ${invoice.totalTTC.toFixed(3)} ${currency}`, 350, y, { align: 'right' });
};

module.exports = renderSimplePDF;
