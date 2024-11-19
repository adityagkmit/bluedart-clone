const { Status, Shipment } = require('../models');
const { sendShipmentStatusUpdateEmail } = require('../helpers/email.helper');
const ApiError = require('../helpers/response.helper').ApiError;
const { Op } = require('sequelize');

const createStatus = async (data, user, transaction = null) => {
  const shipment = await Shipment.findByPk(data.shipment_id, { transaction });
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

  const status = await Status.create(data, { transaction });
  await shipment.update({ status: data.name }, { transaction });

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

const deleteStatus = async (id, user) => {
  const status = await Status.findByPk(id, { include: { model: Shipment } });
  if (!status) {
    throw new ApiError(404, 'Status not found');
  }

  const shipment = status.Shipment;
  if (shipment.delivery_agent_id !== user.id && !user.Roles.some(role => role.name === 'Admin')) {
    throw new ApiError(403, 'Access denied. You are not authorized to delete the status for this shipment.');
  }

  if (shipment.status === status.name) {
    // Find the previous status for this shipment, ordered by created_at in descending order
    const previousStatus = await Status.findOne({
      where: {
        shipment_id: shipment.id,
        created_at: { [Op.lt]: status.created_at }, // Only statuses created before the current one
      },
      order: [['created_at', 'DESC']],
    });

    // Update the shipment's status to the previous status name or set a default if none exists
    await shipment.update({ status: previousStatus ? previousStatus.name : 'Pending' });
  }

  await status.destroy();
  return true;
};

module.exports = {
  createStatus,
  getStatusById,
  deleteStatus,
};
