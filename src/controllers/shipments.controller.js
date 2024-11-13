const shipmentService = require('../services/shipments.service');

exports.createShipment = async (req, res) => {
  try {
    const shipment = await shipmentService.createShipment(req.body, req.user.id);
    res.status(201).json({ message: 'Shipment created successfully', shipment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
