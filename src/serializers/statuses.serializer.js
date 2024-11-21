const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require('../helpers/serializer.helper');

const statusesSerializer = (req, res, next) => {
  if (!res.data) return next();

  const serializeStatus = status => ({
    id: status.id,
    shipmentId: status.shipment_id,
    name: status.name,
    ...normalizeTimestamps(status),
  });

  const serializeData = data => {
    if (Array.isArray(data)) {
      return data.map(serializeStatus);
    } else if (data) {
      return serializeStatus(data);
    }
    return data; // Fallback for null or undefined data
  };

  res.data = removeCircularReferences(res.data);
  res.data = serializeData(res.data);
  res.data = toCamelCase(res.data); // Convert keys to camelCase
  next();
};

module.exports = statusesSerializer;
