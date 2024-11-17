const { Shipment, User, Status, Report } = require('../models');
const { uploadFileToS3 } = require('../helpers/aws.helper');
const { createShipmentPdf, createCustomerPdf } = require('../helpers/pdf.helper');
const { ApiError } = require('../helpers/response.helper');
const { Op } = require('sequelize');

exports.generateShipmentReport = async (filters, userId, roles) => {
  const whereConditions = {};

  // Dynamic Filters
  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Shipment.rawAttributes).includes(key)) {
      whereConditions[key] = { [Op.eq]: value };
    }
  }

  if (filters.startDate && filters.endDate) {
    whereConditions.created_at = {
      [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)],
    };
  }

  if (roles.includes('Customer')) {
    whereConditions.user_id = userId; // Customers can only access their own shipments
  } else if (roles.includes('Delivery Agent')) {
    whereConditions.delivery_agent_id = userId; // Delivery agents can only access their assigned shipments
  }

  const shipments = await Shipment.findAll({
    where: whereConditions,
    include: [
      { model: User, as: 'user', attributes: ['name', 'email'] },
      { model: Status, as: 'statuses', attributes: ['name'] },
    ],
  });

  if (shipments.length === 0) {
    throw new ApiError(404, 'No shipments found for the given filters.');
  }

  const totalShipments = shipments.length;
  const successfulDeliveries = shipments.filter(s => s.status === 'Delivered').length;
  const inTransit = shipments.filter(s => s.status === 'In Transit').length;
  const pendingShipments = shipments.filter(s => s.status === 'Pending').length;
  const totalValue = shipments.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);

  const metadata = {
    totalShipments,
    successfulDeliveries,
    inTransit,
    pendingShipments,
    totalValue,
    filtersApplied: filters,
    reportGeneratedForRoles: roles,
  };

  // Prepare PDF content
  const pdfData = {
    title: 'Shipment Report',
    content: shipments.map(
      shipment =>
        `Shipment ID: ${shipment.id}, Status: ${shipment.status}, User: ${shipment.user.name}, Created At: ${shipment.created_at}`
    ),
    metadata: [
      `Total Shipments: ${totalShipments}`,
      `Successful Deliveries: ${successfulDeliveries}`,
      `In Transit: ${inTransit}`,
      `Pending Shipments: ${pendingShipments}`,
      `Total Value of Shipments: Rs ${totalValue.toFixed(2)}`,
      ...Object.entries(filters).map(([key, value]) => `${key}: ${value}`),
    ],
  };

  const fileName = `shipment_report_${Date.now()}`;
  const pdfPath = await createShipmentPdf(pdfData, fileName);

  const url = await uploadFileToS3(
    { path: pdfPath, originalname: `${fileName}.pdf`, mimetype: 'application/pdf' },
    fileName
  );

  await Report.create({
    user_id: userId,
    url,
  });

  return { url, metadata };
};

exports.generateCustomerReport = async (filters, userId) => {
  const whereConditions = {
    user_id: userId,
  };

  // Dynamic Filters
  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Shipment.rawAttributes).includes(key)) {
      whereConditions[key] = { [Op.eq]: value };
    }
  }

  if (filters.startDate && filters.endDate) {
    whereConditions.created_at = {
      [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)],
    };
  }

  if (filters.maxPrice) {
    whereConditions.price = whereConditions.price
      ? { ...whereConditions.price, [Op.lte]: filters.maxPrice }
      : { [Op.lte]: filters.maxPrice };
  }

  const shipments = await Shipment.findAll({
    where: whereConditions,
    include: [
      { model: User, as: 'user', attributes: ['name', 'email'] },
      { model: Status, as: 'statuses', attributes: ['name'] },
    ],
  });

  if (shipments.length === 0) {
    throw new ApiError(404, 'No shipments found for the given period.');
  }

  const totalShipments = shipments.length;
  const totalSpending = shipments.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
  const successfulDeliveries = shipments.filter(s => s.status === 'Delivered').length;

  // Prepare data for the PDF
  const pdfData = {
    title: 'Customer Report',
    content: shipments.map(
      shipment =>
        `Shipment ID: ${shipment.id}, Status: ${shipment.status}, Price: $${shipment.price}, Destination: ${shipment.destination}, Created At: ${shipment.created_at}`
    ),
    metadata: [
      `Total Shipments: ${totalShipments}`,
      `Total Spending: $${Number(totalSpending).toFixed(2)}`,
      `Successful Deliveries: ${successfulDeliveries}`,
      ...Object.entries(filters).map(([key, value]) => `${key}: ${value}`),
    ],
  };

  const fileName = `customer_report_${Date.now()}`;
  const pdfPath = await createCustomerPdf(pdfData, fileName);

  const url = await uploadFileToS3(
    { path: pdfPath, originalname: `${fileName}.pdf`, mimetype: 'application/pdf' },
    fileName
  );

  await Report.create({
    user_id: userId,
    url,
    type: 'Customer Report',
  });

  return { url, metadata: pdfData.metadata };
};
