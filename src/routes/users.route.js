const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validator.middleware');
const { userIdValidateSchema, createUserSchema, updateUserSchema } = require('../validators/users.validator');
const paginationSchema = require('../validators/pagination.validator');
const upload = require('../middlewares/multer.middleware');

// Routes for user operations
router.get('/', auth, roles('Admin'), validate(paginationSchema, false, true), userController.getAllUsers);
router.post('/', auth, roles('Admin'), validate(createUserSchema), userController.createUser);
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

router.get(
  '/:id/payments',
  auth,
  roles(['Admin'], true),
  validate(userIdValidateSchema, true),
  validate(paginationSchema, false, true),
  userController.getUserPayments
);

router.post(
  '/upload-document',
  auth,
  roles(['Customer, Delivery Agent']),
  upload.single('document'),
  userController.uploadDocument
);

router.patch(
  '/:id/verify-document',
  auth,
  roles(['Admin']),
  validate(userIdValidateSchema, true),
  userController.verifyDocument
);

module.exports = router;
