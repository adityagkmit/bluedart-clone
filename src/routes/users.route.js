const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { auth } = require('../middlewares/auth.middleware');
const allowedRoles = require('../middlewares/role.middleware');

// Routes for user operations
router.get('/', auth, allowedRoles(['Admin']), userController.getAllUsers);

module.exports = router;
