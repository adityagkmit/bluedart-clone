const { extractCityFromAddress, getCityTier, calculatePrice } = require('../helpers/shipments.helper');
const { Shipment, Rate, User, Status } = require('../models');

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

exports.getAllShipments = async (page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  const shipments = await Shipment.findAndCountAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Rate, as: 'rate' },
      { model: Status, as: 'statuses' },
    ],
    limit,
    offset,
  });

  return {
    totalShipments: shipments.count,
    totalPages: Math.ceil(shipments.count / pageSize),
    currentPage: page,
    pageSize,
    shipments: shipments.rows,
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
    return null;
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
