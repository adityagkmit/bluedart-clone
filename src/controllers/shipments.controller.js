const shipmentService = require('../services/shipments.service');

exports.createShipment = async (req, res) => {
  try {
    const shipment = await shipmentService.createShipment(req.body, req.user.id);
    res.status(201).json({ message: 'Shipment created successfully', shipment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllShipments = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  try {
    const result = await shipmentService.getAllShipments(Number(page), Number(pageSize));
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: 'An error occurred while fetching shipments', error: error.message });
  }
};
