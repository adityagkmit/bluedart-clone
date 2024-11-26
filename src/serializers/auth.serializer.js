const { toCamelCase } = require('../helpers/serializer.helper');

const serializeAuthResponse = (req, res, next) => {
  if (!res.data) return next();

  const data = res.data;

  const serializedData = (() => {
    if (data.otp) {
      return { otp: data.otp };
    } else if (data.token && data.user) {
      return {
        token: data.token,
        user: {
          name: data.user.name,
          email: data.user.email,
          phoneNumber: data.user.phoneNumber,
          documentUrl: data.user.documentUrl,
          isEmailVerified: data.user.isEmailVerified,
          isDocumentVerified: data.user.isDocumentVerified,
          roles: data.user.roles,
        },
      };
    } else if (data.id) {
      return {
        name: data.name,
        email: data.email,
        phoneNumber: data.phone_number,
        documentUrl: data.document_url,
        isEmailVerified: data.is_email_verified,
        isDocumentVerified: data.is_document_verified,
      };
    } else {
      return data; // Default pass-through
    }
  })();

  res.data = toCamelCase(serializedData);
  next();
};

module.exports = {
  serializeAuthResponse,
};
