const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require('../helpers/serializer.helper');

const shipmentSerializer = (req, res, next) => {
  if (!res.data) return next();

  const serializeShipments = shipments => {
    return shipments.map(shipment => ({
      id: shipment.id,
      trackingNumber: shipment.tracking_number,
      status: shipment.status,
      customerName: shipment.customer_name,
      customerEmail: shipment.customer_email,
      deliveryAddress: shipment.delivery_address,
      preferredDeliveryDate: shipment.preferred_delivery_date,
      preferredDeliveryTime: shipment.preferred_delivery_time,
      agentAssigned: shipment.delivery_agent_id ? shipment.delivery_agent_name : null,
      ...normalizeTimestamps(shipment),
    }));
  };

  const serializeShipment = shipment => ({
    id: shipment.id,
    trackingNumber: shipment.tracking_number,
    status: shipment.status,
    customerName: shipment.customer_name,
    customerEmail: shipment.customer_email,
    deliveryAddress: shipment.delivery_address,
    preferredDeliveryDate: shipment.preferred_delivery_date,
    preferredDeliveryTime: shipment.preferred_delivery_time,
    agentAssigned: shipment.delivery_agent_id ? shipment.delivery_agent_name : null,
    ...normalizeTimestamps(shipment),
  });

  const serializeData = data => {
    if (data.shipments) {
      return {
        totalItems: data.totalItems,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        shipments: serializeShipments(data.shipments),
      };
    } else if (data.shipment) {
      return serializeShipment(data.shipment);
    } else {
      return data; // Default fallback for other responses
    }
  };

  res.data = removeCircularReferences(res.data);
  res.data = serializeData(res.data);
  res.data = toCamelCase(res.data); // Apply camelCase conversion here
  next();
};

module.exports = {
  shipmentSerializer,
};
