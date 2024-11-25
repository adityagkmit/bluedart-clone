const express = require('express');
const statusController = require('../controllers/statuses.controller');
const validate = require('../middlewares/validator.middleware');
const { statusIdValidateSchema } = require('../validators/statuses.validator');
const { auth } = require('../middlewares/auth.middleware');
const { ADMIN, CUSTOMER, DELIVERYAGENT } = require('../constants/roles');
const roles = require('../middlewares/role.middleware');
const checkDocumentVerified = require('../middlewares/document.middleware');
const responseHandler = require('../middlewares/response.middleware');
const statusesSerializer = require('../serializers/statuses.serializer');
const applySerializer = require('../middlewares/serializer.middleware');

const router = express.Router();

router.get(
  '/:id',
  auth,
  checkDocumentVerified,
  roles([ADMIN, DELIVERYAGENT, CUSTOMER]),
  validate(statusIdValidateSchema, true),
  statusController.getStatusById,
  applySerializer(statusesSerializer),
  responseHandler
);

module.exports = router;
