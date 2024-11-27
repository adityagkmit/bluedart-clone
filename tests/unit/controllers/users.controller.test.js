const {
  getCurrentUser,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserShipments,
  getUserPayments,
  uploadDocument,
  verifyDocument,
} = require('../../../src/controllers/users.controller');
const userService = require('../../../src/services/users.service');
const { ApiError } = require('../../../src/helpers/response.helper');

jest.mock('../../../src/services/users.service');

describe('Users Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      headers: {},
      file: null,
      user: { id: 1 },
    };
    mockRes = {
      data: null,
      message: null,
      statusCode: null,
    };
    mockNext = jest.fn();
  });

  describe('getCurrentUser', () => {
    it('should return current user and call next()', async () => {
      mockReq.user = { id: 1, email: 'test@example.com' };

      await getCurrentUser(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockReq.user);
      expect(mockRes.message).toBe('User details retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Unexpected error');
      mockNext.mockImplementationOnce(() => {
        throw error;
      });

      await getCurrentUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, 'Failed to retrieve user details.'));
    });
  });

  describe('getAllUsers', () => {
    it('should retrieve all users and call next()', async () => {
      const users = [{ id: 1, email: 'user1@example.com' }];
      userService.getAllUsers.mockResolvedValue(users);

      await getAllUsers(mockReq, mockRes, mockNext);

      expect(userService.getAllUsers).toHaveBeenCalledWith(mockReq.query);
      expect(mockRes.data).toEqual(users);
      expect(mockRes.message).toBe('Users retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Failed to fetch users');
      userService.getAllUsers.mockRejectedValue(error);

      await getAllUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, 'Failed to retrieve users', [error.message]));
    });
  });

  describe('getUserById', () => {
    it('should retrieve user by ID and call next()', async () => {
      const user = { id: 1, email: 'user@example.com' };
      userService.getUserById.mockResolvedValue(user);

      mockReq.params.id = '1';

      await getUserById(mockReq, mockRes, mockNext);

      expect(userService.getUserById).toHaveBeenCalledWith(mockReq.params.id);
      expect(mockRes.data).toEqual(user);
      expect(mockRes.message).toBe('User retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle user not found and call next() with ApiError', async () => {
      userService.getUserById.mockResolvedValue(null);

      mockReq.params.id = '1';

      await getUserById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(404, 'User not found'));
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Unexpected error');
      userService.getUserById.mockRejectedValue(error);

      mockReq.params.id = '1';

      await getUserById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, error.message));
    });
  });

  describe('createUser', () => {
    it('should create a user and call next()', async () => {
      const newUser = { id: 1, email: 'newuser@example.com' };
      userService.createUserByAdmin.mockResolvedValue(newUser);

      mockReq.body = { email: 'newuser@example.com', password: 'password123' };

      await createUser(mockReq, mockRes, mockNext);

      expect(userService.createUserByAdmin).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.data).toEqual(newUser);
      expect(mockRes.message).toBe('User created successfully');
      expect(mockRes.statusCode).toBe(201);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Creation failed');
      userService.createUserByAdmin.mockRejectedValue(error);

      await createUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, error.message));
    });
  });

  describe('updateUser', () => {
    it('should update a user and call next()', async () => {
      const updatedUser = { id: 1, email: 'updateduser@example.com' };
      userService.updateUserById.mockResolvedValue(updatedUser);

      mockReq.params.id = '1';
      mockReq.body = { email: 'updateduser@example.com' };

      await updateUser(mockReq, mockRes, mockNext);

      expect(userService.updateUserById).toHaveBeenCalledWith(mockReq.params.id, mockReq.body);
      expect(mockRes.data).toEqual(updatedUser);
      expect(mockRes.message).toBe('User updated successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle user not found and call next() with ApiError', async () => {
      userService.updateUserById.mockResolvedValue(null);

      mockReq.params.id = '1';

      await updateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(404, 'User not found or no changes made'));
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Update failed');
      userService.updateUserById.mockRejectedValue(error);

      mockReq.params.id = '1';

      await updateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, error.message));
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and call next()', async () => {
      userService.deleteUserById.mockResolvedValue();

      mockReq.params.id = '1';

      await deleteUser(mockReq, mockRes, mockNext);

      expect(userService.deleteUserById).toHaveBeenCalledWith(mockReq.params.id);
      expect(mockRes.data).toBeNull();
      expect(mockRes.message).toBe('User deleted successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Deletion failed');
      userService.deleteUserById.mockRejectedValue(error);

      mockReq.params.id = '1';

      await deleteUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, error.message));
    });
  });

  describe('getUserShipments', () => {
    it('should retrieve user shipments and call next()', async () => {
      const shipments = [{ id: 1, shipmentId: '123', status: 'shipped' }];
      userService.getShipmentsByUserId.mockResolvedValue(shipments);

      mockReq.params.id = '1';
      mockReq.query = { status: 'shipped' };

      await getUserShipments(mockReq, mockRes, mockNext);

      expect(userService.getShipmentsByUserId).toHaveBeenCalledWith(mockReq.params.id, mockReq.query);
      expect(mockRes.data).toEqual(shipments);
      expect(mockRes.message).toBe('User Shipments retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Failed to fetch shipments');
      userService.getShipmentsByUserId.mockRejectedValue(error);

      mockReq.params.id = '1';

      await getUserShipments(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, error.message));
    });
  });

  describe('getUserPayments', () => {
    it('should retrieve user payments and call next()', async () => {
      const payments = [{ id: 1, paymentId: 'abc123', amount: 100 }];
      userService.getPaymentsByUserId.mockResolvedValue(payments);

      mockReq.params.id = '1';
      mockReq.query = { status: 'paid' };

      await getUserPayments(mockReq, mockRes, mockNext);

      expect(userService.getPaymentsByUserId).toHaveBeenCalledWith(mockReq.params.id, mockReq.query);
      expect(mockRes.data).toEqual(payments);
      expect(mockRes.message).toBe('User payments retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Failed to fetch payments');
      userService.getPaymentsByUserId.mockRejectedValue(error);

      mockReq.params.id = '1';

      await getUserPayments(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, error.message));
    });
  });

  describe('uploadDocument', () => {
    it('should upload document and call next()', async () => {
      const result = { success: true, fileUrl: 'http://example.com/document.pdf' };
      userService.uploadDocument.mockResolvedValue(result);
      mockReq.file = { originalname: 'document.pdf' };

      await uploadDocument(mockReq, mockRes, mockNext);

      expect(userService.uploadDocument).toHaveBeenCalledWith(mockReq.file, mockReq.user.id);
      expect(mockRes.data).toEqual(result);
      expect(mockRes.message).toBe('Document uploaded successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle missing file and call next() with ApiError', async () => {
      mockReq.file = null;

      await uploadDocument(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, 'No document uploaded.'));
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Failed to upload document');
      userService.uploadDocument.mockRejectedValue(error);

      mockReq.file = { originalname: 'document.pdf' };

      await uploadDocument(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, error.message));
    });
  });

  describe('verifyDocument', () => {
    it('should verify document and call next()', async () => {
      userService.verifyUserDocument.mockResolvedValue();

      mockReq.params.id = '1';

      await verifyDocument(mockReq, mockRes, mockNext);

      expect(userService.verifyUserDocument).toHaveBeenCalledWith(mockReq.params.id);
      expect(mockRes.message).toBe('Document verified successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Failed to verify document');
      userService.verifyUserDocument.mockRejectedValue(error);

      mockReq.params.id = '1';

      await verifyDocument(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, error.message));
    });
  });
});
