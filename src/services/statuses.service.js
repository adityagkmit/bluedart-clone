const { Status, Shipment } = require('../models');
const { sendShipmentStatusUpdateEmail } = require('../helpers/email.helper');
const ApiError = require('../helpers/response.helper').ApiError;

const createStatus = async (data, user, transaction = null) => {
  const shipment = await Shipment.findByPk(data.shipmentId, { transaction });
  if (!shipment) {
    throw new ApiError(404, 'Shipment not found');
  }

  if (
    shipment.delivery_agent_id !== user.id &&
    shipment.user_id !== user.id &&
    !user.Roles.some(role => role.name === 'Admin')
  ) {
    throw new ApiError(403, 'Access denied. You are not authorized to update the status for this shipment.');
  }

  const status = await Status.create(
    {
      shipment_id: data.shipmentId,
      name: data.name,
    },
    { transaction }
  );

  const emailData = {
    userName: user.name,
    shipmentId: shipment.id,
    status: data.name,
  };

  await sendShipmentStatusUpdateEmail(user.email, emailData);

  return status;
};

const getStatusById = async (data, user) => {
  const { id: userId, roles: userRoles } = user;
  const statusId = data.id;

  const status = await Status.findByPk(statusId, {
    include: [
      {
        model: Shipment,
        attributes: ['id', 'user_id', 'delivery_agent_id'],
      },
    ],
  });

  if (!status) {
    throw new ApiError(404, 'Status not found');
  }

  const shipment = status.Shipment;

  if (userRoles.includes('Admin')) {
    return status;
  } else if (userRoles.includes('Customer')) {
    if (shipment.user_id !== userId) {
      throw new ApiError(403, 'Access denied. You can only view statuses for your shipments.');
    }
    return status;
  } else if (userRoles.includes('Delivery Agent')) {
    if (shipment.delivery_agent_id !== userId) {
      throw new ApiError(403, 'Access denied. You can only view statuses for shipments you are assigned to.');
    }
    return status;
  } else {
    throw new ApiError(403, 'Access denied. You do not have permission to access this status.');
  }
};

module.exports = {
  createStatus,
  getStatusById,
};
