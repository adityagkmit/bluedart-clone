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

// Update Shipment by actions
const updateShipmentThroughAction = async (req, res, next) => {
  try {
    const { action, deliveryAgentId, status, preferredDeliveryDate, preferredDeliveryTime } = req.body;
    const { id } = req.params;
    const userId = req.user.id;
    const userRoles = req.user.Roles.map(role => role.name);

    let updatedShipment;

    switch (action) {
      case 'updateStatus':
        if (!userRoles.includes('Admin') && !userRoles.includes('Delivery Agent')) {
          throw new ApiError(403, 'You do not have permission to update the status');
        }
        updatedShipment = await shipmentService.updateShipmentStatus(
          {
            shipmentId: id,
            status: status,
          },
          req.user
        );
        res.message = 'Shipment status updated successfully';
        break;

      case 'assignAgent':
        if (!userRoles.includes('Admin')) {
          throw new ApiError(403, 'Only Admins can assign delivery agents');
        }
        updatedShipment = await shipmentService.assignDeliveryAgent(id, deliveryAgentId);
        res.message = 'Delivery agent assigned successfully';
        break;

      case 'reschedule':
        if (!userRoles.includes('Admin')) {
          throw new ApiError(403, 'You are not authorized to reschedule this shipment');
        }
        updatedShipment = await shipmentService.rescheduleShipment(id, {
          preferredDeliveryDate: preferredDeliveryDate,
          preferredDeliveryTime: preferredDeliveryTime,
          userId,
          userRoles,
        });
        res.message = 'Shipment rescheduled successfully';
        break;

      default:
        throw new ApiError(400, 'Invalid action');
    }

    if (!updatedShipment) {
      throw new ApiError(404, 'Shipment not found or could not be updated');
    }

    res.data = updatedShipment;
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
  updateShipmentThroughAction,
};
