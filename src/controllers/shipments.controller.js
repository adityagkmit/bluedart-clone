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

exports.getShipmentById = async (req, res) => {
  try {
    const shipment = await shipmentService.getShipmentById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.status(200).json(shipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateShipment = async (req, res) => {
  try {
    const updatedShipment = await shipmentService.updateShipment(req.params.id, req.body);
    if (!updatedShipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.status(200).json(updatedShipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteShipment = async (req, res) => {
  try {
    const result = await shipmentService.deleteShipment(req.params.id, req.user);
    if (!result) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.status(200).json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};