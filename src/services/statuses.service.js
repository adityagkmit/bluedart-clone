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

const getStatusById = async id => {
  return await Status.findByPk(id);
};

module.exports = {
  createStatus,
  getStatusById,
};
