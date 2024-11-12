const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { auth } = require('../middlewares/auth.middleware');
const allowedRoles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validator.middleware');
const { userIdValidateSchema } = require('../validators/users.validator');

// Routes for user operations
router.get('/', auth, allowedRoles(['Admin']), userController.getAllUsers);
router.get('/:id', auth, validate(userIdValidateSchema, true), userController.getUserById);

module.exports = router;
