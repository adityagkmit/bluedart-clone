const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require('../helpers/serializer.helper');

const userSerializer = (req, res, next) => {
  if (!res.data) return next();

  const serializeUsers = users =>
    users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      documentUrl: user.document_url || null,
      isEmailVerified: user.is_email_verified || false,
      isDocumentVerified: user.is_document_verified || false,
      roles: user.roles || [],
      ...normalizeTimestamps(user),
    }));

  const serializeUser = user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phone_number,
    documentUrl: user.document_url || null,
    isEmailVerified: user.is_email_verified || false,
    isDocumentVerified: user.is_document_verified || false,
    roles: user.roles || [],
    ...normalizeTimestamps(user),
  });

  const serializePayments = payments => ({
    totalItems: payments.totalItems,
    totalPages: payments.totalPages,
    currentPage: payments.currentPage,
    payments: payments.shipments.map(payment => ({
      id: payment.id,
      userId: payment.userId,
      status: payment.status,
      shipmentId: payment.shipmentId,
      amount: payment.amount,
      method: payment.method,
      transactionDetails: payment.transactionDetails || null,
      ...normalizeTimestamps(payment),
      shipment: payment.shipment
        ? {
            id: payment.shipment.id,
            status: payment.shipment.status,
          }
        : null,
      statuses: payment.statuses || [],
    })),
  });

  const serializeShipments = shipments => ({
    totalItems: shipments.totalItems,
    totalPages: shipments.totalPages,
    currentPage: shipments.currentPage,
    shipments: shipments.data.map(shipment => ({
      id: shipment.id,
      userId: shipment.user_id,
      pickupAddress: shipment.pickup_address,
      deliveryAddress: shipment.delivery_address,
      weight: shipment.weight,
      dimensions: shipment.dimensions,
      isFragile: shipment.is_fragile,
      deliveryOption: shipment.delivery_option,
      status: shipment.status,
      rateId: shipment.rate_id,
      price: shipment.price,
      preferredDeliveryDate: shipment.preferred_delivery_date,
      preferredDeliveryTime: shipment.preferred_delivery_time,
      deliveryAgentId: shipment.delivery_agent_id,
      ...normalizeTimestamps(shipment),
      user: shipment.user
        ? {
            id: shipment.user.id,
            name: shipment.user.name,
            email: shipment.user.email,
          }
        : null,
      statuses: shipment.statuses || [],
    })),
  });

  const serializeData = data => {
    if (data.users) {
      return {
        totalItems: data.totalItems,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        users: serializeUsers(data.users),
      };
    }
    if (data.shipments) {
      return serializeShipments(data.shipments);
    }
    if (data.payments) {
      return serializePayments(data);
    }
    if (data.user) {
      return serializeUser(data.user);
    }
    if (data.documentUrl) {
      return { documentUrl: data.documentUrl };
    }
    return data; // Default fallback for other responses
  };

  // Apply serialization
  res.data = removeCircularReferences(res.data);
  res.data = toCamelCase(serializeData(res.data));
  next();
};

module.exports = {
  userSerializer,
};
