const { Status, Shipment } = require('../models');
const ApiError = require('../helpers/response.helper').ApiError;
const { Op } = require('sequelize');

exports.createStatus = async (data, user) => {
  // Check if the user is the delivery agent for the shipment
  const shipment = await Shipment.findByPk(data.shipment_id);
  if (!shipment) {
    throw new ApiError(404, 'Shipment not found');
  }

  if (shipment.delivery_agent_id !== user.id && !user.Roles.some(role => role.name === 'Admin')) {
    throw new ApiError(403, 'Access denied. You are not authorized to update the status for this shipment.');
  }

  // Create the status
  const status = await Status.create(data);

  // Update the status field in the Shipment table
  await shipment.update({ status: data.name });

  return status;
};

exports.getStatusById = async id => {
  return await Status.findByPk(id);
};

exports.deleteStatus = async (id, user) => {
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
