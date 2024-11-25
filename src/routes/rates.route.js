const express = require('express');
const ratesController = require('../controllers/rates.controller');
const { auth } = require('../middlewares/auth.middleware');
const { ADMIN } = require('../constants/roles');
const roles = require('../middlewares/role.middleware');
const responseHandler = require('../middlewares/response.middleware');
const ratesSerializer = require('../serializers/rates.serializer');
const applySerializer = require('../middlewares/serializer.middleware');

const router = express.Router();

router.get(
  '/',
  auth,
  roles([ADMIN]),
  ratesController.getAllRates,
  applySerializer(ratesSerializer),
  responseHandler
);

module.exports = router;
