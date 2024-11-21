const applySerializer = serializer => (req, res, next) => {
  if (!serializer || typeof serializer !== 'function') {
    return next();
  }
  serializer(req, res, next);
};

module.exports = applySerializer;
