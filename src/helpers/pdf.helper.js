const pdfkit = require('pdfkit');
const fs = require('fs');

async function createShipmentPdf(data, fileName) {
  const filePath = `./src/uploads/${fileName}.pdf`;

  return new Promise((resolve, reject) => {
    const pdf = new pdfkit();
    const writeStream = fs.createWriteStream(filePath);

    pdf.pipe(writeStream);

    // Title Section
    pdf.fontSize(20).text(data.title, { align: 'center', underline: true });
    pdf.moveDown();

    // Metadata Section
    pdf.fontSize(16).text('Report Summary:', { underline: true });
    pdf.moveDown(0.5);
    data.metadata.forEach(line => {
      pdf.fontSize(12).text(line);
    });
    pdf.moveDown();

    // Content Section
    pdf.fontSize(16).text('Shipment Details:', { underline: true });
    pdf.moveDown(0.5);
    data.content.forEach(line => {
      pdf.fontSize(12).text(line);
      pdf.moveDown(0.3);
    });

    pdf.end();

    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
}

async function createCustomerPdf(data, fileName) {
  const filePath = `./src/uploads/${fileName}.pdf`;

  return new Promise((resolve, reject) => {
    const pdf = new pdfkit();
    const writeStream = fs.createWriteStream(filePath);

    pdf.pipe(writeStream);

    // Title Section
    pdf.fontSize(20).text(data.title, { align: 'center', underline: true });
    pdf.moveDown();

    // Metadata Section
    pdf.fontSize(16).text('Report Summary:', { underline: true });
    pdf.moveDown(0.5);
    data.metadata.forEach(line => {
      pdf.fontSize(12).text(line);
    });
    pdf.moveDown();

    // Content Section
    pdf.fontSize(16).text('Customer Details:', { underline: true });
    pdf.moveDown(0.5);
    data.content.forEach(line => {
      pdf.fontSize(12).text(line);
      pdf.moveDown(0.3);
    });

    pdf.end();

    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
}

module.exports = {
  createShipmentPdf,
  createCustomerPdf,
};
