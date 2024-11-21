const { ApiResponse } = require('../helpers/response.helper');

const responseHandler = (req, res) => {
  ApiResponse.send(res, res.statusCode || 200, res.message || 'Success', res.data || null);
};

module.exports = responseHandler;
