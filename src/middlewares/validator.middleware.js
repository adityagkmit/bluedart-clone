function validate(schema, params = false, query = false) {
  return (req, res, next) => {
    let validationResult;

    if (params) {
      validationResult = schema.validate(req.params);
    } else if (query) {
      validationResult = schema.validate(req.query);
    } else {
      validationResult = schema.validate(req.body);
    }

    const { error } = validationResult;

    if (error) {
      return res.status(400).json({
        errors: error.details.map(detail => ({
          message: detail.message,
          path: detail.path,
        })),
      });
    }

    next();
  };
}

module.exports = validate;
