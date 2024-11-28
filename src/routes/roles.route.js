const express = require('express');
const rolesController = require('../controllers/roles.controller');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const { responseHandler } = require('../helpers/response.helper');
const { ADMIN } = require('../constants/roles');

const router = express.Router();

router.get('/', auth, roles([ADMIN]), rolesController.getAllRoles, responseHandler);

module.exports = router;
