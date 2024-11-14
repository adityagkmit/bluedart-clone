const shipmentService = require('../services/shipments.service');

exports.createShipment = async (req, res) => {
  try {
    const shipment = await shipmentService.createShipment(req.body, req.user.id);
    res.status(201).json({ message: 'Shipment created successfully', shipment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getShipments = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.query;
    const shipments = await shipmentService.getShipments(filters, page, limit);
    res.status(200).json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(400).json({ message: 'An error occurred while fetching shipments.' });
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

exports.updateShipmentStatus = async (req, res) => {
  try {
    const updatedShipment = await shipmentService.updateShipmentStatus(req.params.id, req.body.status);
    if (!updatedShipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.status(200).json(updatedShipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.assignDeliveryAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_agent_id } = req.body;

    const updatedShipment = await shipmentService.assignDeliveryAgent(id, delivery_agent_id);

    if (!updatedShipment) {
      return res.status(404).json({ message: 'Shipment not found or could not be updated' });
    }

    res.status(200).json({ message: 'Delivery agent assigned successfully', shipment: updatedShipment });
  } catch (error) {
    console.error('Error assigning delivery agent:', error);
    res.status(400).json({ message: 'An error occurred while assigning the delivery agent' });
  }
};
