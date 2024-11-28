const express = require('express');
const ratesController = require('../controllers/rates.controller');
const { auth } = require('../middlewares/auth.middleware');
const { ADMIN } = require('../constants/roles');
const roles = require('../middlewares/role.middleware');
const { responseHandler } = require('../helpers/response.helper');
const ratesSerializer = require('../serializers/rates.serializer');

const router = express.Router();

router.get('/', auth, roles([ADMIN]), ratesController.getAllRates, ratesSerializer, responseHandler);

module.exports = router;
