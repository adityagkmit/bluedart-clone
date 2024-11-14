const express = require('express');
const statusController = require('../controllers/statuses.controller');
const router = express.Router();
const validate = require('../middlewares/validator.middleware');
const { createStatusSchema } = require('../validators/statuses.validator');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');

router.post(
  '/',
  auth,
  roles(['Admin', 'Delivery Agent']),
  validate(createStatusSchema),
  statusController.createStatus
);

module.exports = router;
