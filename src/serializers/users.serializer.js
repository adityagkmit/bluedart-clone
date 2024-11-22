const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require('../helpers/serializer.helper');

const userSerializer = (req, res, next) => {
  if (!res.data) return next();

  const serializeUsers = users => {
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      documentUrl: user.document_url || null,
      isDocumentVerified: user.is_document_verified || false,
      roles: user.roles || [],
      ...normalizeTimestamps(user),
    }));
  };

  const serializeUser = user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phone_number,
    documentUrl: user.document_url || null,
    isDocumentVerified: user.is_document_verified || false,
    roles: user.roles || [],
    ...normalizeTimestamps(user),
  });

  const serializePayments = payments => ({
    total: payments.total,
    pages: payments.pages,
    currentPage: payments.currentPage,
    payments: payments.data.map(payment => ({
      id: payment.id,
      userId: payment.user_id,
      shipmentId: payment.shipment_id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      transactionDetails: payment.transaction_details || null,
      ...normalizeTimestamps(payment),
      shipment: payment.Shipment
        ? {
            id: payment.Shipment.id,
            status: payment.Shipment.status,
          }
        : null,
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
    } else if (data.user) {
      return serializeUser(data.user);
    } else if (data.payments) {
      return serializePayments(data.payments);
    } else if (data.documentUrl) {
      return { documentUrl: data.documentUrl };
    } else {
      return data; // Default fallback for other responses
    }
  };

  res.data = removeCircularReferences(res.data);
  res.data = toCamelCase(serializeData(res.data));
  next();
};

module.exports = {
  userSerializer,
};
