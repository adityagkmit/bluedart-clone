const { Status, Shipment } = require('../models');
const ApiError = require('../helpers/response.helper').ApiError;

exports.createStatus = async (data, userId) => {
  // Check if the user is the delivery agent for the shipment
  const shipment = await Shipment.findByPk(data.shipment_id);
  if (!shipment) {
    throw new ApiError(404, 'Shipment not found');
  }

  console.log('delivery_agent_id', shipment.delivery_agent_id);
  console.log('userId', userId);

  if (shipment.delivery_agent_id !== userId) {
    throw new ApiError(403, 'Access denied. You are not authorized to update the status for this shipment.');
  }

  // Create the status
  const status = await Status.create(data);

  // Update the status field in the Shipment table
  await shipment.update({ status: data.name });

  return status;
};
