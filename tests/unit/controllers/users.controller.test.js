const {
  getCurrentUser,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserPayments,
  uploadDocument,
  verifyDocument,
} = require('../../../src/controllers/users.controller');
const userService = require('../../../src/services/users.service');
const { ApiError } = require('../../../src/helpers/response.helper');
const { faker } = require('@faker-js/faker');

jest.mock('../../../src/services/users.service'); // Mocking userService

describe('User Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      user: { id: '123', name: 'John Doe', email: 'john@example.com' },
      params: { id: '123' },
      body: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
      query: { page: 1, limit: 10 },
    };
    mockRes = { data: null, message: null, statusCode: null };
    mockNext = jest.fn();
  });

  describe('getCurrentUser', () => {
    it('should handle errors when fetching user details', async () => {
      const mockReq = { user: undefined }; // Simulate missing user
      const mockRes = {};
      const mockNext = jest.fn();

      jest.spyOn(console, 'error').mockImplementation(() => {});

      await getCurrentUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));

      // Additional assertions on the ApiError instance
      const errorInstance = mockNext.mock.calls[0][0];
      expect(errorInstance.message).toBe('Failed to retrieve user details.');
      expect(errorInstance.statusCode).toBe(400);

      // Restore console.error
      console.error.mockRestore();
    });
  });

  describe('getAllUsers', () => {
    it('should fetch all users successfully', async () => {
      const users = [{ id: '123', name: 'John Doe' }];
      userService.getAllUsers.mockResolvedValue(users);

      await getAllUsers(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(users);
      expect(mockRes.message).toBe('Users retrieved successfully');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching users', async () => {
      userService.getAllUsers.mockRejectedValue(new Error('Error retrieving users'));

      await getAllUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  describe('getUserById', () => {
    it('should fetch user by id successfully', async () => {
      const user = { id: '123', name: 'John Doe' };
      userService.getUserById.mockResolvedValue(user);

      await getUserById(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(user);
      expect(mockRes.message).toBe('User retrieved successfully');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      await getUserById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'User not found',
        })
      );
    });

    it('should handle errors when fetching user by id', async () => {
      userService.getUserById.mockRejectedValue(new Error('Error fetching user'));

      await getUserById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const newUser = { id: '123', name: 'John Doe', email: 'john@example.com' };
      userService.createUserByAdmin.mockResolvedValue(newUser);

      await createUser(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(newUser);
      expect(mockRes.message).toBe('User created successfully');
      expect(mockRes.statusCode).toBe(201);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors during user creation', async () => {
      userService.createUserByAdmin.mockRejectedValue(new Error('Error creating user'));

      await createUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updatedUser = { id: '123', name: 'John Updated' };
      userService.updateUserById.mockResolvedValue(updatedUser);

      await updateUser(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(updatedUser);
      expect(mockRes.message).toBe('User updated successfully');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 404 if user not found or no changes made', async () => {
      userService.updateUserById.mockResolvedValue(null);

      await updateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'User not found or no changes made',
        })
      );
    });

    it('should handle errors during user update', async () => {
      userService.updateUserById.mockRejectedValue(new Error('Error updating user'));

      await updateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      userService.deleteUserById.mockResolvedValue();

      await deleteUser(mockReq, mockRes, mockNext);

      expect(mockRes.data).toBeNull();
      expect(mockRes.message).toBe('User deleted successfully');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors during user deletion', async () => {
      userService.deleteUserById.mockRejectedValue(new Error('Error deleting user'));

      await deleteUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  describe('getUserPayments', () => {
    it('should fetch user payments successfully', async () => {
      const payments = [{ id: '1', amount: 100 }];
      userService.getPaymentsByUserId.mockResolvedValue(payments);

      await getUserPayments(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(payments);
      expect(mockRes.message).toBe('User payments retrieved successfully');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when fetching user payments', async () => {
      userService.getPaymentsByUserId.mockRejectedValue(new Error('Error fetching payments'));

      await getUserPayments(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      const result = { success: true };
      mockReq.file = { originalname: 'doc.pdf' };
      userService.uploadDocument.mockResolvedValue(result);

      await uploadDocument(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(result);
      expect(mockRes.message).toBe('Document uploaded successfully');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return error if no document uploaded', async () => {
      mockReq.file = null;

      await uploadDocument(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'No document uploaded.',
        })
      );
    });

    it('should handle errors during document upload', async () => {
      mockReq.file = { originalname: 'doc.pdf' };
      userService.uploadDocument.mockRejectedValue(new Error('Error uploading document'));

      await uploadDocument(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  describe('verifyDocument', () => {
    it('should verify document successfully', async () => {
      const user = { id: '123', documentVerified: true };
      userService.verifyUserDocument.mockResolvedValue(user);

      await verifyDocument(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(user);
      expect(mockRes.message).toBe('Document verified successfully');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors during document verification', async () => {
      userService.verifyUserDocument.mockRejectedValue(new Error('Error verifying document'));

      await verifyDocument(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });
});
