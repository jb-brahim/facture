const renderModernPDF = (doc, data) => {
  const { company, customer, invoice } = data;
  const currency = invoice.currency || 'TND';

  // --- TOP ACCENT BAR ---
  doc.rect(0, 0, 612, 12).fill('#2C3E50');

  // Company Header
  doc.fillColor('#2C3E50').fontSize(22).text(company.name, 50, 40);
  doc.fillColor('#7F8C8D').fontSize(9).text(company.address || '', 50, 68);
  if (company.taxId) {
    doc.text(`Matricule Fiscal: ${company.taxId}`, 50, 80);
  }

  // Invoice Number Header Right
  doc.fillColor('#2980B9').fontSize(20).text('FACTURE', 350, 40, { align: 'right' });
  doc.fillColor('#34495E').fontSize(10)
     .text(`# ${invoice.invoiceNumber || 'DRAFT'}`, 350, 65, { align: 'right' })
     .text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 350, 80, { align: 'right' });

  // Bill To Box
  doc.rect(50, 115, 500, 65).fill('#F8F9FA');
  doc.fillColor('#2980B9').fontSize(10).text('CLIENT', 65, 123);
  doc.fillColor('#2C3E50').fontSize(11).text(customer.name, 65, 137);
  doc.fillColor('#7F8C8D').fontSize(9).text(customer.address || '', 65, 152);

  const applyVat = invoice.applyVat !== false;

  // Table
  let y = 200;
  doc.rect(50, y, 500, 20).fill('#2C3E50');
  if (applyVat) {
    doc.fillColor('#FFFFFF').fontSize(9)
       .text('Réf / SKU', 60, y + 5, { width: 75 })
       .text('Article', 140, y + 5, { width: 145 })
       .text('Origine', 290, y + 5, { width: 45, align: 'center' })
       .text('Qté', 340, y + 5, { width: 30, align: 'right' })
       .text('Prix Unit', 375, y + 5, { width: 55, align: 'right' })
       .text('TVA', 435, y + 5, { width: 35, align: 'right' })
       .text('Total HT', 475, y + 5, { width: 70, align: 'right' });
  } else {
    doc.fillColor('#FFFFFF').fontSize(9)
       .text('Réf / SKU', 60, y + 5, { width: 85 })
       .text('Article', 155, y + 5, { width: 185 })
       .text('Origine', 345, y + 5, { width: 45, align: 'center' })
       .text('Qté', 395, y + 5, { width: 35, align: 'right' })
       .text('Prix Unit', 435, y + 5, { width: 55, align: 'right' })
       .text('Total HT', 495, y + 5, { width: 50, align: 'right' });
  }

  y += 24;
  doc.fillColor('#2C3E50');
  invoice.items.forEach(item => {
    const refStr = item.reference || '—';
    if (applyVat) {
      doc.text(refStr, 60, y, { width: 75 })
         .text(item.productName, 140, y, { width: 145 })
         .text(item.originCountry || 'USA', 290, y, { width: 45, align: 'center' })
         .text(item.quantity.toString(), 340, y, { width: 30, align: 'right' })
         .text(item.unitPrice.toFixed(3), 375, y, { width: 55, align: 'right' })
         .text(`${item.vatRate}%`, 435, y, { width: 35, align: 'right' })
         .text(`${item.lineHT.toFixed(3)} ${currency}`, 475, y, { width: 70, align: 'right' });
    } else {
      doc.text(refStr, 60, y, { width: 85 })
         .text(item.productName, 155, y, { width: 185 })
         .text(item.originCountry || 'USA', 345, y, { width: 45, align: 'center' })
         .text(item.quantity.toString(), 395, y, { width: 35, align: 'right' })
         .text(item.unitPrice.toFixed(3), 435, y, { width: 55, align: 'right' })
         .text(`${item.lineHT.toFixed(3)} ${currency}`, 495, y, { width: 50, align: 'right' });
    }
    y += 20;
  });

  // Totals
  y += 15;
  doc.fontSize(9).fillColor('#7F8C8D')
     .text('Total HT:', 350, y, { width: 90, align: 'right' })
     .text(`${invoice.totalHT.toFixed(3)} ${currency}`, 450, y, { width: 90, align: 'right' });
  
  if (applyVat) {
    y += 15;
    doc.text('TVA:', 350, y, { width: 90, align: 'right' })
       .text(`${invoice.vatTotal.toFixed(3)} ${currency}`, 450, y, { width: 90, align: 'right' });
  }

  y += 18;
  doc.fillColor('#27AE60').fontSize(12)
     .text('Net à payer:', 350, y, { width: 90, align: 'right' })
     .text(`${invoice.totalTTC.toFixed(3)} ${currency}`, 450, y, { width: 90, align: 'right' });
};

module.exports = renderModernPDF;
