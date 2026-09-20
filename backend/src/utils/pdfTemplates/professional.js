const PDFDocument = require('pdfkit');

const renderProfessionalPDF = (doc, data) => {
  const { company, customer, invoice } = data;
  const currency = invoice.currency || 'TND';

  // --- HEADER: Company Info & Title ---
  doc.fillColor('#1A2B4C')
     .fontSize(20)
     .text(company.name.toUpperCase(), 50, 45, { bold: true });

  if (company.legalName) {
    doc.fontSize(10).fillColor('#555555').text(company.legalName, 50, 70);
  }

  const companyAddress = [
    company.address,
    [company.city, company.postalCode, company.country].filter(Boolean).join(', '),
    company.phone ? `Phone: ${company.phone}` : null,
    company.email ? `Email: ${company.email}` : null,
    company.taxId ? `Matricule Fiscal: ${company.taxId}` : null
  ].filter(Boolean).join('\n');

  doc.fontSize(9).fillColor('#444444').text(companyAddress, 50, 85);

  // Invoice Title Right Aligned
  doc.fillColor('#1A2B4C')
     .fontSize(22)
     .text('INVOICE', 350, 45, { align: 'right' });

  doc.fontSize(10).fillColor('#666666')
     .text(`Number: ${invoice.invoiceNumber || 'DRAFT'}`, 350, 75, { align: 'right' })
     .text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 350, 90, { align: 'right' })
     .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 350, 105, { align: 'right' })
     .text(`Status: ${(invoice.status || '').toUpperCase()}`, 350, 120, { align: 'right' });

  // Divider line
  doc.moveTo(50, 160).lineTo(550, 160).strokeColor('#E0E0E0').lineWidth(1).stroke();

  // --- BILL TO / CUSTOMER INFO ---
  doc.fontSize(11).fillColor('#1A2B4C').text('BILL TO:', 50, 175, { bold: true });
  
  const customerInfo = [
    customer.companyName ? `${customer.name} (${customer.companyName})` : customer.name,
    customer.address,
    [customer.city, customer.postalCode, customer.country].filter(Boolean).join(', '),
    customer.phone ? `Phone: ${customer.phone}` : null,
    customer.email ? `Email: ${customer.email}` : null,
    customer.taxId ? `Tax ID / Matricule Fiscal: ${customer.taxId}` : null
  ].filter(Boolean).join('\n');

  doc.fontSize(9).fillColor('#333333').text(customerInfo, 50, 192);

  const applyVat = invoice.applyVat !== false;

  // --- TABLE HEADER ---
  let y = 270;
  doc.rect(50, y, 500, 22).fill('#1A2B4C');

  if (applyVat) {
    doc.fillColor('#FFFFFF').fontSize(9)
       .text('Ref / SKU', 60, y + 6, { width: 75 })
       .text('Item / Description', 140, y + 6, { width: 145 })
       .text('Origin', 290, y + 6, { width: 45, align: 'center' })
       .text('Qty', 340, y + 6, { width: 30, align: 'right' })
       .text('Unit Price', 375, y + 6, { width: 55, align: 'right' })
       .text('VAT %', 435, y + 6, { width: 35, align: 'right' })
       .text('Total HT', 475, y + 6, { width: 70, align: 'right' });
  } else {
    doc.fillColor('#FFFFFF').fontSize(9)
       .text('Ref / SKU', 60, y + 6, { width: 85 })
       .text('Item / Description', 155, y + 6, { width: 185 })
       .text('Origin', 345, y + 6, { width: 45, align: 'center' })
       .text('Qty', 395, y + 6, { width: 35, align: 'right' })
       .text('Unit Price', 435, y + 6, { width: 55, align: 'right' })
       .text('Total HT', 495, y + 6, { width: 50, align: 'right' });
  }

  // --- TABLE ROWS ---
  y += 25;
  doc.fillColor('#333333');

  invoice.items.forEach((item, index) => {
    // Alternating row background
    if (index % 2 === 1) {
      doc.rect(50, y - 4, 500, 20).fill('#F9F9F9');
    }

    const refStr = item.reference || '—';
    doc.fillColor('#333333').fontSize(9);

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

    y += 22;
  });

  // Divider
  doc.moveTo(50, y + 5).lineTo(550, y + 5).strokeColor('#E0E0E0').lineWidth(1).stroke();
  y += 15;

  // --- SUMMARY / TOTALS ---
  const summaryX = 350;

  doc.fontSize(9).fillColor('#555555')
     .text('Subtotal HT:', summaryX, y, { width: 90, align: 'right' })
     .text(`${invoice.subtotalHT.toFixed(3)} ${currency}`, summaryX + 100, y, { width: 90, align: 'right' });
  y += 16;

  if (invoice.discount > 0) {
    doc.text('Discount:', summaryX, y, { width: 90, align: 'right' })
       .text(`-${invoice.discount.toFixed(3)} ${currency}`, summaryX + 100, y, { width: 90, align: 'right' });
    y += 16;
  }

  if (applyVat) {
    doc.text('VAT Total:', summaryX, y, { width: 90, align: 'right' })
       .text(`${invoice.vatTotal.toFixed(3)} ${currency}`, summaryX + 100, y, { width: 90, align: 'right' });
    y += 18;
  }

  // Highlighted Total TTC Box
  doc.rect(summaryX, y - 2, 195, 24).fill('#1A2B4C');
  doc.fillColor('#FFFFFF').fontSize(11)
     .text('TOTAL TTC:', summaryX + 10, y + 4, { width: 90 })
     .text(`${invoice.totalTTC.toFixed(3)} ${currency}`, summaryX + 90, y + 4, { width: 95, align: 'right' });

  // --- FOOTER: Bank details & Terms ---
  let footerY = 650;
  doc.moveTo(50, footerY).lineTo(550, footerY).strokeColor('#E0E0E0').lineWidth(1).stroke();
  footerY += 10;

  doc.fillColor('#1A2B4C').fontSize(9).text('Payment Information & Terms:', 50, footerY, { bold: true });
  footerY += 14;

  const paymentNotes = [
    company.bankName ? `Bank: ${company.bankName}` : null,
    company.bankAccount ? `RIB / Account: ${company.bankAccount}` : null,
    invoice.paymentTerms ? `Payment Terms: ${invoice.paymentTerms}` : null,
    invoice.notes ? `Notes: ${invoice.notes}` : null
  ].filter(Boolean).join(' | ');

  doc.fillColor('#666666').fontSize(8).text(paymentNotes || 'Thank you for your business!', 50, footerY, { width: 500 });
};

module.exports = renderProfessionalPDF;
