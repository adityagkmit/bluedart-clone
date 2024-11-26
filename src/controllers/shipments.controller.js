const { ApiError } = require('../helpers/response.helper');
const shipmentService = require('../services/shipments.service');

// Create Shipment
const createShipment = async (req, res, next) => {
  try {
    const shipment = await shipmentService.createShipment(req.body, req.user.id);
    res.data = shipment;
    res.message = 'Shipment created successfully';
    res.statusCode = 201;
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Get Shipments
const getShipments = async (req, res, next) => {
  try {
    const shipments = await shipmentService.getShipments(req.query);
    res.data = shipments;
    res.message = 'Shipments retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Get Shipment by ID
const getShipmentById = async (req, res, next) => {
  try {
    const shipment = await shipmentService.getShipmentById(req.params.id);
    if (!shipment) {
      return next(new ApiError(404, 'Shipment not found'));
    }
    res.data = shipment;
    res.message = 'Shipment retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Get Shipment Statuses
const getShipmentStatuses = async (req, res, next) => {
  try {
    const shipmentId = req.params.id;
    const statuses = await shipmentService.getShipmentStatuses(shipmentId);
    res.data = statuses;
    res.message = 'Shipment statuses retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Update Shipment
const updateShipment = async (req, res, next) => {
  try {
    const updatedShipment = await shipmentService.updateShipment(req.params.id, req.body);
    if (!updatedShipment) {
      return next(new ApiError(404, 'Shipment not found'));
    }
    res.data = updatedShipment;
    res.message = 'Shipment updated successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Delete Shipment
const deleteShipment = async (req, res, next) => {
  try {
    const result = await shipmentService.deleteShipment(req.params.id, req.user);
    if (!result) {
      return next(new ApiError(404, 'Shipment not found'));
    }
    res.data = null;
    res.message = 'Shipment deleted successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Update Shipment by actions
const updateShipmentThroughAction = async (req, res, next) => {
  try {
    const result = await shipmentService.performActionOnShipment(req.params.id, req.body, req.user);

    if (!result) {
      throw new ApiError(404, 'Shipment not found or could not be updated');
    }

    res.data = result.shipment;
    res.message = result.message;
    next();
  } catch (error) {
    next(new ApiError(error.status || 400, error.message));
  }
};

module.exports = {
  createShipment,
  getShipments,
  getShipmentById,
  getShipmentStatuses,
  updateShipment,
  deleteShipment,
  updateShipmentThroughAction,
};
