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
    const { page, limit, ...filters } = req.query;
    const shipments = await shipmentService.getShipments(filters, page, limit);
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

// Update Shipment Status
const updateShipmentStatus = async (req, res, next) => {
  try {
    const updatedShipment = await shipmentService.updateShipmentStatus(req.params.id, req.body.status);
    if (!updatedShipment) {
      return next(new ApiError(404, 'Shipment not found'));
    }
    res.data = updatedShipment;
    res.message = 'Shipment status updated successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Assign Delivery Agent
const assignDeliveryAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { delivery_agent_id } = req.body;
    const updatedShipment = await shipmentService.assignDeliveryAgent(id, delivery_agent_id);
    if (!updatedShipment) {
      return next(new ApiError(404, 'Shipment not found or could not be updated'));
    }
    res.data = updatedShipment;
    res.message = 'Delivery agent assigned successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Reschedule Shipment
const rescheduleShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { preferred_delivery_date, preferred_delivery_time } = req.body;
    const userId = req.user.id;
    const userRoles = req.user.Roles.map(role => role.name);

    const updatedShipment = await shipmentService.rescheduleShipment(id, {
      preferred_delivery_date,
      preferred_delivery_time,
      userId,
      userRoles,
    });

    if (!updatedShipment) {
      return next(new ApiError(404, 'Shipment not found or cannot be rescheduled'));
    }

    res.data = updatedShipment;
    res.message = 'Delivery rescheduled successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

module.exports = {
  createShipment,
  getShipments,
  getShipmentById,
  getShipmentStatuses,
  updateShipment,
  deleteShipment,
  updateShipmentStatus,
  assignDeliveryAgent,
  rescheduleShipment,
};
