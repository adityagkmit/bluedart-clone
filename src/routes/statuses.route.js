const express = require('express');
const statusController = require('../controllers/statuses.controller');
const validate = require('../middlewares/validator.middleware');
const { createStatusSchema, statusIdValidateSchema } = require('../validators/statuses.validator');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const checkDocumentVerified = require('../middlewares/document.middleware');
const responseHandler = require('../middlewares/response.middleware');
const statusesSerializer = require('../serializers/statuses.serializer');
const applySerializer = require('../middlewares/serializer.middleware');

const router = express.Router();

router.post(
  '/',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent']),
  validate(createStatusSchema),
  statusController.createStatus,
  applySerializer(statusesSerializer),
  responseHandler
);

router.get(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent', 'Customer']),
  validate(statusIdValidateSchema, true),
  statusController.getStatusById,
  applySerializer(statusesSerializer),
  responseHandler
);

router.delete(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent']),
  validate(statusIdValidateSchema, true),
  statusController.deleteStatus,
  applySerializer(statusesSerializer),
  responseHandler
);

module.exports = router;
