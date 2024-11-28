const express = require('express');
const statusController = require('../controllers/statuses.controller');
const validate = require('../middlewares/validator.middleware');
const { statusIdValidateSchema } = require('../validators/statuses.validator');
const { auth } = require('../middlewares/auth.middleware');
const { ADMIN, CUSTOMER, DELIVERYAGENT } = require('../constants/roles');
const roles = require('../middlewares/role.middleware');
const checkDocumentVerification = require('../middlewares/document.middleware');
const { responseHandler } = require('../helpers/response.helper');
const statusesSerializer = require('../serializers/statuses.serializer');

const router = express.Router();

router.get(
  '/:id',
  auth,
  checkDocumentVerification,
  roles([ADMIN, DELIVERYAGENT, CUSTOMER]),
  validate(statusIdValidateSchema, true),
  statusController.getStatusById,
  statusesSerializer,
  responseHandler
);

module.exports = router;
