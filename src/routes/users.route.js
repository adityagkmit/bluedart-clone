const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validator.middleware');
const { userIdValidateSchema, createUserSchema, updateUserSchema } = require('../validators/users.validator');

// Routes for user operations
router.get('/', auth, roles(), userController.getAllUsers);
router.post('/', auth, roles(), validate(createUserSchema), userController.createUser);
router.get('/:id', auth, validate(userIdValidateSchema, true), userController.getUserById);

router.put(
  '/:id',
  auth,
  roles(['Admin'], true),
  validate(updateUserSchema),
  validate(userIdValidateSchema, true),
  userController.updateUser
);

router.delete(
  '/:id',
  auth,
  roles(['Admin'], true),
  validate(userIdValidateSchema, true),
  userController.deleteUser
);

module.exports = router;
