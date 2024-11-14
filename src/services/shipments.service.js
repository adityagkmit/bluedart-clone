const { extractCityFromAddress, getCityTier, calculatePrice } = require('../helpers/shipments.helper');
const { Shipment, Rate, User, Status, Role } = require('../models');
const { Op } = require('sequelize');

exports.createShipment = async (shipmentData, userId) => {
  const { delivery_address } = shipmentData;
  const city = await extractCityFromAddress(delivery_address);
  const cityTier = getCityTier(city);

  const rate = await Rate.findOne({ where: { city_tier: cityTier } });
  if (!rate) {
    throw new Error(`No rate found for city tier ${cityTier}`);
  }

  const shipment = await Shipment.create({
    user_id: userId,
    rate_id: rate.id,
    price: calculatePrice(rate, shipmentData),
    ...shipmentData,
  });

  return shipment;
};

exports.getShipments = async (filters, page = 1, limit = 10) => {
  const whereConditions = {};

  // Construct the filter conditions dynamically
  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Shipment.rawAttributes).includes(key)) {
      whereConditions[key] = { [Op.eq]: value }; // Use appropriate Sequelize operator
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

exports.getShipmentById = async shipmentId => {
  return await Shipment.findByPk(shipmentId, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Rate, as: 'rate' },
      { model: Status, as: 'statuses' },
    ],
  });
};

exports.updateShipment = async (shipmentId, data) => {
  const shipment = await Shipment.findByPk(shipmentId);
  if (!shipment) {
    throw new Error(`No shipment found with id: ${shipmentId}`);
  }

  if (data.delivery_address || data.weight || data.dimensions || data.is_fragile || data.delivery_option) {
    const deliveryAddress = data.delivery_address || shipment.delivery_address;
    const city = await extractCityFromAddress(deliveryAddress);
    const cityTier = getCityTier(city);

    const rate = await Rate.findOne({ where: { city_tier: cityTier } });
    if (!rate) {
      throw new Error(`No rate found for city tier ${cityTier}`);
    }

    const updatedPrice = calculatePrice(rate, {
      ...shipment.toJSON(),
      ...data,
    });

    data.rate_id = rate.id;
    data.price = updatedPrice;
  }

  const [updatedRowCount, updatedShipment] = await Shipment.update(data, {
    where: { id: shipmentId },
    returning: true,
  });

  if (updatedRowCount === 0) return null;
  return updatedShipment[0];
};

exports.deleteShipment = async (shipmentId, user) => {
  const shipment = await Shipment.findByPk(shipmentId);
  if (!shipment) return null;

  // Check if the user has the right to delete (self or admin)
  if (shipment.user_id !== user.id && !user.Roles.some(role => role.name === 'Admin')) {
    throw new Error('Access denied. Insufficient permissions.');
  }

  await shipment.destroy();
  return true;
};

exports.updateShipmentStatus = async (shipmentId, status) => {
  const shipment = await Shipment.findByPk(shipmentId);
  if (!shipment) {
    throw new Error(`No shipment found with id: ${shipmentId}`);
  }

  shipment.status = status;
  await shipment.save();
  return shipment;
};

exports.assignDeliveryAgent = async (shipmentId, deliveryAgentId) => {
  const deliveryAgent = await User.findOne({
    where: { id: deliveryAgentId },
    include: {
      model: Role,
      where: { name: 'Delivery Agent' },
      through: { attributes: [] },
    },
  });

  if (!deliveryAgent) {
    throw new Error('Delivery agent not found or does not have the correct role');
  }

  const [updatedRowCount, updatedShipments] = await Shipment.update(
    { delivery_agent_id: deliveryAgentId },
    { where: { id: shipmentId }, returning: true }
  );

  return updatedRowCount > 0 ? updatedShipments[0] : null;
};
