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
const applySerializer = require('../middlewares/serializer.middleware');
const responseHandler = require('../middlewares/response.middleware');

router.get('/me', auth, userController.getCurrentUser, applySerializer(userSerializer), responseHandler);

router.get(
  '/',
  auth,
  roles([ADMIN]),
  validate(paginationSchema, false, true),
  userController.getAllUsers,
  applySerializer(userSerializer),
  responseHandler
);

router.post(
  '/',
  auth,
  roles([ADMIN]),
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
  roles([ADMIN], true),
  validate(updateUserSchema),
  validate(userIdValidateSchema, true),
  userController.updateUser,
  applySerializer(userSerializer),
  responseHandler
);

router.delete(
  '/:id',
  auth,
  roles([ADMIN], true),
  validate(userIdValidateSchema, true),
  userController.deleteUser,
  applySerializer(userSerializer),
  responseHandler
);

router.get(
  '/:id/shipments',
  auth,
  roles([ADMIN, CUSTOMER], true),
  validate(userIdValidateSchema, true),
  validate(paginationSchema, false, true),
  userController.getUserShipments,
  applySerializer(userSerializer),
  responseHandler
);

router.get(
  '/:id/payments',
  auth,
  roles([ADMIN, CUSTOMER], true),
  validate(userIdValidateSchema, true),
  validate(paginationSchema, false, true),
  userController.getUserPayments,
  applySerializer(userSerializer),
  responseHandler
);

router.post(
  '/upload-document',
  auth,
  roles([CUSTOMER, DELIVERYAGENT]),
  upload.single('document'),
  userController.uploadDocument,
  applySerializer(userSerializer),
  responseHandler
);

router.patch(
  '/:id',
  auth,
  roles([ADMIN]),
  validate(userIdValidateSchema, true),
  userController.verifyDocument,
  applySerializer(userSerializer),
  responseHandler
);

module.exports = router;
