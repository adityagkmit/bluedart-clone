const { ApiError, ApiResponse } = require('../helpers/response.helper');
const shipmentService = require('../services/shipments.service');

const createShipment = async (req, res) => {
  try {
    const shipment = await shipmentService.createShipment(req.body, req.user.id);
    return ApiResponse.send(res, 201, 'Shipment created successfully', shipment);
  } catch (error) {
    console.error('Error creating shipment:', error);
    return ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const getShipments = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.query;
    const shipments = await shipmentService.getShipments(filters, page, limit);
    return ApiResponse.send(res, 200, 'Shipments retrieved successfully', shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return ApiError.handleError(new ApiError(400, 'An error occurred while fetching shipments.'), res);
  }
};

const getShipmentById = async (req, res) => {
  try {
    const shipment = await shipmentService.getShipmentById(req.params.id);
    if (!shipment) {
      return ApiError.handleError(new ApiError(404, 'Shipment not found'), res);
    }
    return ApiResponse.send(res, 200, 'Shipment retrieved successfully', shipment);
  } catch (error) {
    console.error('Error fetching shipment by ID:', error);
    return ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const getShipmentStatuses = async (req, res) => {
  try {
    const shipmentId = req.params.id;
    const statuses = await shipmentService.getShipmentStatuses(shipmentId);
    ApiResponse.send(res, 200, 'Shipment statuses retrieved successfully', statuses);
  } catch (error) {
    ApiError.handleError(error, res);
  }
};

const updateShipment = async (req, res) => {
  try {
    const updatedShipment = await shipmentService.updateShipment(req.params.id, req.body);
    if (!updatedShipment) {
      return ApiError.handleError(new ApiError(404, 'Shipment not found'), res);
    }
    return ApiResponse.send(res, 200, 'Shipment updated successfully', updatedShipment);
  } catch (error) {
    console.error('Error updating shipment:', error);
    return ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const deleteShipment = async (req, res) => {
  try {
    const result = await shipmentService.deleteShipment(req.params.id, req.user);
    if (!result) {
      return ApiError.handleError(new ApiError(404, 'Shipment not found'), res);
    }
    return ApiResponse.send(res, 200, 'Shipment deleted successfully');
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const updateShipmentStatus = async (req, res) => {
  try {
    const updatedShipment = await shipmentService.updateShipmentStatus(req.params.id, req.body.status);
    if (!updatedShipment) {
      return ApiError.handleError(new ApiError(404, 'Shipment not found'), res);
    }
    return ApiResponse.send(res, 200, 'Shipment status updated successfully', updatedShipment);
  } catch (error) {
    console.error('Error updating shipment status:', error);
    return ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const assignDeliveryAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_agent_id } = req.body;
    const updatedShipment = await shipmentService.assignDeliveryAgent(id, delivery_agent_id);
    if (!updatedShipment) {
      return ApiError.handleError(new ApiError(404, 'Shipment not found or could not be updated'), res);
    }
    return ApiResponse.send(res, 200, 'Delivery agent assigned successfully', updatedShipment);
  } catch (error) {
    console.error('Error assigning delivery agent:', error);
    return ApiError.handleError(
      new ApiError(400, 'An error occurred while assigning the delivery agent'),
      res
    );
  }
};

const rescheduleShipment = async (req, res) => {
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
      return ApiError.handleError(new ApiError(404, 'Shipment not found or cannot be rescheduled'), res);
    }

    return ApiResponse.send(res, 200, 'Delivery rescheduled successfully', updatedShipment);
  } catch (error) {
    console.error('Error rescheduling shipment:', error);
    return ApiError.handleError(new ApiError(400, error.message), res);
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
