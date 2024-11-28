const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validator.middleware');
const { userIdValidateSchema, createUserSchema, updateUserSchema } = require('../validators/users.validator');
const { ADMIN, CUSTOMER, DELIVERYAGENT } = require('../constants/roles');
const paginationSchema = require('../validators/pagination.validator');
const upload = require('../middlewares/multer.middleware');
const { userSerializer } = require('../serializers/users.serializer');
const { responseHandler } = require('../helpers/response.helper');

router.get('/me', auth, userController.getCurrentUser, userSerializer, responseHandler);

router.get(
  '/',
  auth,
  roles([ADMIN]),
  validate(paginationSchema, false, true),
  userController.getAllUsers,
  userSerializer,
  responseHandler
);

router.post(
  '/',
  auth,
  roles([ADMIN]),
  validate(createUserSchema),
  userController.createUser,
  userSerializer,
  responseHandler
);

router.get(
  '/:id',
  auth,
  validate(userIdValidateSchema, true),
  userController.getUserById,
  userSerializer,
  responseHandler
);

router.put(
  '/:id',
  auth,
  roles([ADMIN], true),
  validate(updateUserSchema),
  validate(userIdValidateSchema, true),
  userController.updateUser,
  userSerializer,
  responseHandler
);

router.delete(
  '/:id',
  auth,
  roles([ADMIN], true),
  validate(userIdValidateSchema, true),
  userController.deleteUser,
  userSerializer,
  responseHandler
);

router.get(
  '/:id/shipments',
  auth,
  roles([ADMIN, CUSTOMER], true),
  validate(userIdValidateSchema, true),
  validate(paginationSchema, false, true),
  userController.getUserShipments,
  userSerializer,
  responseHandler
);

router.get(
  '/:id/payments',
  auth,
  roles([ADMIN, CUSTOMER], true),
  validate(userIdValidateSchema, true),
  validate(paginationSchema, false, true),
  userController.getUserPayments,
  userSerializer,
  responseHandler
);

router.post(
  '/upload-document',
  auth,
  roles([CUSTOMER, DELIVERYAGENT]),
  upload.single('document'),
  userController.uploadDocument,
  userSerializer,
  responseHandler
);

router.patch(
  '/:id',
  auth,
  roles([ADMIN]),
  validate(userIdValidateSchema, true),
  userController.verifyDocument,
  userSerializer,
  responseHandler
);

module.exports = router;
