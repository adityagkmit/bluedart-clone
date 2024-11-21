const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validator.middleware');
const { userIdValidateSchema, createUserSchema, updateUserSchema } = require('../validators/users.validator');
const paginationSchema = require('../validators/pagination.validator');
const upload = require('../middlewares/multer.middleware');
const { userSerializer } = require('../serializers/users.serializer');
const applySerializer = require('../middlewares/serializer.middleware');
const responseHandler = require('../middlewares/response.middleware');

router.get(
  '/',
  auth,
  roles('Admin'),
  validate(paginationSchema, false, true),
  userController.getAllUsers,
  applySerializer(userSerializer),
  responseHandler
);

router.post(
  '/',
  auth,
  roles('Admin'),
  validate(createUserSchema),
  userController.createUser,
  applySerializer(userSerializer),
  responseHandler
);

router.get(
  '/:id',
  auth,
  validate(userIdValidateSchema, true),
  userController.getUserById,
  applySerializer(userSerializer),
  responseHandler
);

router.put(
  '/:id',
  auth,
  roles(['Admin'], true),
  validate(updateUserSchema),
  validate(userIdValidateSchema, true),
  userController.updateUser,
  applySerializer(userSerializer),
  responseHandler
);

router.delete(
  '/:id',
  auth,
  roles(['Admin'], true),
  validate(userIdValidateSchema, true),
  userController.deleteUser,
  applySerializer(userSerializer),
  responseHandler
);

router.get(
  '/:id/payments',
  auth,
  roles(['Admin'], true),
  validate(userIdValidateSchema, true),
  validate(paginationSchema, false, true),
  userController.getUserPayments,
  applySerializer(userSerializer),
  responseHandler
);

router.post(
  '/upload-document',
  auth,
  roles(['Customer', 'Delivery Agent']),
  upload.single('document'),
  userController.uploadDocument,
  applySerializer(userSerializer),
  responseHandler
);

router.patch(
  '/:id/verify-document',
  auth,
  roles(['Admin']),
  validate(userIdValidateSchema, true),
  userController.verifyDocument,
  applySerializer(userSerializer),
  responseHandler
);

module.exports = router;
