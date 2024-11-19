const express = require('express');
const statusController = require('../controllers/statuses.controller');
const router = express.Router();
const validate = require('../middlewares/validator.middleware');
const { createStatusSchema, statusIdValidateSchema } = require('../validators/statuses.validator');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const checkDocumentVerified = require('../middlewares/document.middleware');

router.post(
  '/',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent']),
  validate(createStatusSchema),
  statusController.createStatus
);

router.get(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent', 'Customer']),
  validate(statusIdValidateSchema, true),
  statusController.getStatusById
);

router.delete(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent']),
  validate(statusIdValidateSchema, true),
  statusController.deleteStatus
);

module.exports = router;
