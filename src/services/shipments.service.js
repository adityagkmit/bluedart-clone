const { extractCityFromAddress, getCityTier, calculatePrice } = require('../helpers/shipments.helper');
const { Shipment, Rate, User, Status, Role } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../helpers/email.helper');
const { ApiError } = require('../helpers/response.helper');

const createShipment = async (data, userId) => {
  const city = await extractCityFromAddress(data.deliveryAddress);
  const cityTier = getCityTier(city);

  const rate = await Rate.findOne({ where: { city_tier: cityTier } });
  if (!rate) {
    throw new ApiError(404, `No rate found for city tier ${cityTier}`);
  }

  const calculatePriceData = {
    weight: data.weight,
    dimensions: data.dimensions,
    is_fragile: data.isFragile,
    delivery_option: data.deliveryOption,
  };

  const shipment = await Shipment.create({
    user_id: userId,
    rate_id: rate.id,
    pickup_address: data.pickupAddress,
    delivery_address: data.deliveryAddress,
    is_fragile: data.isFragile,
    delivery_option: data.deliveryOption,
    preferred_delivery_date: data.preferredDeliveryDate,
    preferred_delivery_time: data.preferredDeliveryTime,
    price: calculatePrice(rate, calculatePriceData),
    ...data,
  });

  return shipment;
};

const getShipments = async (filters, page = 1, limit = 10) => {
  const whereConditions = {};

  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Shipment.rawAttributes).includes(key)) {
      whereConditions[key] = { [Op.eq]: value };
    }
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Shipment.findAndCountAll({
    where: whereConditions,
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Rate, as: 'rate' },
      { model: Status, as: 'statuses' },
    ],
    offset,
    limit: parseInt(limit),
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    shipments: rows,
  };
};

const getShipmentById = async shipmentId => {
  const shipment = await Shipment.findByPk(shipmentId, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Rate, as: 'rate' },
      { model: Status, as: 'statuses' },
    ],
  });

  if (!shipment) {
    throw new ApiError(404, `No shipment found with ID ${shipmentId}`);
  }

  return shipment;
};

const getShipmentStatuses = async shipmentId => {
  const statuses = await Status.findAll({
    where: { shipment_id: shipmentId },
    order: [['created_at', 'ASC']],
  });

  if (!statuses.length) {
    throw new ApiError(404, 'No statuses found for this shipment');
  }

  return statuses;
};

const updateShipment = async (shipmentId, data) => {
  const shipment = await Shipment.findByPk(shipmentId);
  if (!shipment) {
    throw new ApiError(404, `No shipment found with ID ${shipmentId}`);
  }

  if (data.deliveryAddress || data.weight || data.dimensions || data.isFragile || data.deliveryOption) {
    const deliveryAddress = data.deliveryAddress || shipment.delivery_address;
    const city = await extractCityFromAddress(deliveryAddress);
    const cityTier = getCityTier(city);

    const rate = await Rate.findOne({ where: { city_tier: cityTier } });
    if (!rate) {
      throw new ApiError(404, `No rate found for city tier ${cityTier}`);
    }

    const calculatePriceData = {
      weight: data.weight || shipment.weight,
      dimensions: data.dimensions || shipment.dimensions,
      is_fragile: data.isFragile || shipment.is_fragile,
      delivery_option: data.deliveryOption || shipment.delivery_option,
    };

    const updatedPrice = calculatePrice(rate, calculatePriceData);

    data.rateId = rate.id;
    data.price = updatedPrice;
  }

  // Map camelCase to snake_case
  const updateData = {
    pickup_address: data.pickupAddress,
    delivery_address: data.deliveryAddress,
    weight: data.weight,
    dimensions: data.dimensions,
    is_fragile: data.isFragile,
    delivery_option: data.deliveryOption,
    preferred_delivery_date: data.preferredDeliveryDate,
    preferred_delivery_time: data.preferredDeliveryTime,
    rate_id: data.rateId,
    price: data.price,
  };

  // Remove undefined fields
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) delete updateData[key];
  });

  const [updatedRowCount, updatedShipment] = await Shipment.update(updateData, {
    where: { id: shipmentId },
    returning: true,
  });

  if (updatedRowCount === 0) {
    throw new ApiError(400, 'No changes made to the shipment');
  }

  return updatedShipment[0];
};

const deleteShipment = async (shipmentId, user) => {
  const shipment = await Shipment.findByPk(shipmentId);
  if (!shipment) {
    throw new ApiError(404, `No shipment found with ID ${shipmentId}`);
  }

  if (shipment.user_id !== user.id && !user.Roles.some(role => role.name === 'Admin')) {
    throw new ApiError(403, 'Access denied. Insufficient permissions.');
  }

  await shipment.destroy();
  return true;
};

const updateShipmentStatus = async (shipmentId, status) => {
  const shipment = await Shipment.findByPk(shipmentId);
  if (!shipment) {
    throw new ApiError(404, `No shipment found with ID ${shipmentId}`);
  }

  shipment.status = status;
  await shipment.save();
  return shipment;
};

const assignDeliveryAgent = async (shipmentId, deliveryAgentId) => {
  const deliveryAgent = await User.findOne({
    where: { id: deliveryAgentId },
    include: {
      model: Role,
      where: { name: 'Delivery Agent' },
      through: { attributes: [] },
    },
  });

  if (!deliveryAgent) {
    throw new ApiError(404, 'Delivery agent not found or does not have the correct role');
  }

  const [updatedRowCount, updatedShipments] = await Shipment.update(
    { delivery_agent_id: deliveryAgentId },
    { where: { id: shipmentId }, returning: true }
  );

  if (updatedRowCount === 0) {
    throw new ApiError(400, `No shipment updated with ID ${shipmentId}`);
  }

  return updatedShipments[0];
};

const rescheduleShipment = async (shipmentId, data) => {
  const shipment = await Shipment.findByPk(shipmentId);

  if (!shipment) {
    throw new ApiError(404, `No shipment found with ID ${shipmentId}`);
  }

  if (shipment.user_id !== data.userId && !data.userRoles.includes('Admin')) {
    throw new ApiError(403, 'Access denied. User is not the owner of the shipment.');
  }

  shipment.preferred_delivery_date = data.preferredDeliveryDate;
  shipment.preferred_delivery_time = data.preferredDeliveryTime;

  await shipment.save();
  return shipment;
};

const sendShipmentReminders = async () => {
  const shipments = await Shipment.findAll({
    where: {
      status: 'Pending',
      preferred_delivery_date: { [Op.gte]: new Date() },
    },
    include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
  });

  if (shipments.length === 0) {
    console.log('No pending shipments require reminders.');
    return;
  }

  const promises = shipments.map(async shipment => {
    const { user, id, preferred_delivery_date } = shipment;

    const emailData = {
      to: user.email,
      subject: 'Shipment Reminder',
      template: 'shipment-reminder',
      data: {
        user: { name: user.name },
        shipment: { id, deliveryDate: preferred_delivery_date.toDateString() },
      },
    };

    try {
      await sendEmail(emailData);
      console.log(`Reminder sent to ${user.email} for shipment ID: ${id}`);
      await shipment.save();
    } catch (err) {
      console.error(`Failed to send reminder for shipment ID: ${id}`, err);
    }
  });

  await Promise.all(promises);
  console.log('All shipment reminders processed.');
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
  sendShipmentReminders,
  rescheduleShipment,
};
