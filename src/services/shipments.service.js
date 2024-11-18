const { extractCityFromAddress, getCityTier, calculatePrice } = require('../helpers/shipments.helper');
const { Shipment, Rate, User, Status, Role } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../helpers/email.helper');

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

exports.getShipmentStatuses = async shipmentId => {
  const statuses = await Status.findAll({
    where: { shipment_id: shipmentId },
    order: [['created_at', 'ASC']],
  });

  if (!statuses.length) {
    throw new Error('No statuses found for this shipment');
  }

  return statuses;
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

exports.sendShipmentReminders = async () => {
  try {
    const shipments = await Shipment.findAll({
      where: {
        status: 'Pending', // Only pending shipments
        preferred_delivery_date: { [Op.gte]: new Date() }, // Only future deliveries
      },
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
    });

    if (shipments.length === 0) {
      console.log('No pending shipments require reminders.');
      return;
    }

    console.log(`Found ${shipments.length} shipments requiring reminders.`);

    // Process each shipment
    const promises = shipments.map(async shipment => {
      const { user, id, preferred_delivery_date } = shipment;

      console.log(user);
      console.log(user.email);

      const emailData = {
        to: user.email,
        subject: 'Shipment Reminder',
        template: 'shipment-reminder',
        data: {
          user: {
            name: user.name,
          },
          shipment: {
            id,
            deliveryDate: preferred_delivery_date.toDateString(),
          },
        },
      };

      // Send email and update the shipment
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
  } catch (error) {
    console.error('Error while sending shipment reminders:', error);
  }
};

exports.rescheduleShipment = async (shipmentId, data) => {
  const shipment = await Shipment.findByPk(shipmentId);

  if (!shipment) {
    return null;
  }

  // Ensure the user is the owner of the shipment or has the 'Admin' role
  if (shipment.user_id !== data.userId && !data.userRoles.includes('Admin')) {
    throw new Error('Access denied. User is not the owner of the shipment.');
  }

  shipment.preferred_delivery_date = data.preferred_delivery_date;
  shipment.preferred_delivery_time = data.preferred_delivery_time;

  await shipment.save();
  return shipment;
};
