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
