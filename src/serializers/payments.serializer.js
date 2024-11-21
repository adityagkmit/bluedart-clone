const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require('../helpers/serializer.helper');

const serializePayment = payment => ({
  id: payment.id,
  shipmentId: payment.shipment_id,
  userId: payment.user_id,
  amount: payment.amount,
  method: payment.method,
  status: payment.status,
  ...normalizeTimestamps(payment),
});

const serializeData = data => {
  if (Array.isArray(data)) {
    return data.map(serializePayment);
  } else if (data) {
    return serializePayment(data);
  }
  return data; // Fallback for null or undefined data
};

const paymentsSerializer = (req, res, next) => {
  if (!res.data) return next();

  res.data = removeCircularReferences(res.data);
  res.data = serializeData(res.data);
  res.data = toCamelCase(res.data); // Convert keys to camelCase
  next();
};

module.exports = paymentsSerializer;
