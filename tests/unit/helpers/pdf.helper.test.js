const { createShipmentPdf, createCustomerPdf } = require('../../../src/helpers/pdf.helper');
const fs = require('fs');
const pdfkit = require('pdfkit');

// Mock pdfkit and fs.createWriteStream
jest.mock('pdfkit');
jest.mock('fs', () => ({
  createWriteStream: jest.fn(),
}));

describe('PDF Helper', () => {
  const mockData = {
    title: 'Shipment Report',
    metadata: ['Metadata Line 1', 'Metadata Line 2'],
    content: ['Content Line 1', 'Content Line 2'],
  };

  const fileName = 'shipment_report';

  beforeEach(() => {
    pdfkit.mockImplementation(() => ({
      pipe: jest.fn(),
      fontSize: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      moveDown: jest.fn().mockReturnThis(),
      end: jest.fn(),
    }));

    fs.createWriteStream.mockReturnValue({
      on: jest.fn((event, callback) => {
        if (event === 'finish') callback();
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a shipment PDF successfully', async () => {
    const expectedFilePath = `./src/uploads/${fileName}.pdf`;

    const result = await createShipmentPdf(mockData, fileName);

    // Check that the file path returned is correct
    expect(result).toBe(expectedFilePath);

    // Verify that pdfkit methods were called
    const pdf = pdfkit.mock.results[0].value;
    expect(pdf.fontSize).toHaveBeenCalledTimes(7); // fontSize should be called multiple times
    expect(pdf.text).toHaveBeenCalledTimes(7); // text should be called for title, metadata, and content
    expect(pdf.moveDown).toHaveBeenCalledTimes(6); // moveDown should be called to move lines

    // Ensure fs.createWriteStream was called with the correct file path
    expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFilePath);
  });

  it('should create a customer PDF successfully', async () => {
    const expectedFilePath = `./src/uploads/${fileName}.pdf`;

    const result = await createCustomerPdf(mockData, fileName);

    // Check that the file path returned is correct
    expect(result).toBe(expectedFilePath);

    // Verify that pdfkit methods were called
    const pdf = pdfkit.mock.results[0].value;
    expect(pdf.fontSize).toHaveBeenCalledTimes(7); // fontSize should be called multiple times
    expect(pdf.text).toHaveBeenCalledTimes(7); // text should be called for title, metadata, and content
    expect(pdf.moveDown).toHaveBeenCalledTimes(6); // moveDown should be called to move lines

    // Ensure fs.createWriteStream was called with the correct file path
    expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFilePath);
  });

  it('should reject when there is an error generating the PDF', async () => {
    // Mock an error during the PDF generation
    fs.createWriteStream.mockReturnValueOnce({
      on: jest.fn((event, callback) => {
        if (event === 'error') callback(new Error('PDF generation failed'));
      }),
    });

    await expect(createShipmentPdf(mockData, fileName)).rejects.toThrow('PDF generation failed');
  });
});
