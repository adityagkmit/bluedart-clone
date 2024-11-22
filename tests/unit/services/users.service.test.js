const {
  createUser,
  getAllUsers,
  getUserById,
  createUserByAdmin,
  updateUserById,
  deleteUserById,
  getPaymentsByUserId,
  uploadDocument,
  verifyUserDocument,
} = require('../../../src/services/users.service');

const { User, Role, UsersRoles, Payment, Shipment } = require('../../../src/models');
const { redisClient } = require('../../../src/config/redis');
const { uploadFileToS3 } = require('../../../src/helpers/aws.helper');
const bcrypt = require('bcryptjs');
const { ApiError } = require('../../../src/helpers/response.helper');
const { faker } = require('@faker-js/faker');

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('../../../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    update: jest.fn(),
  },
  Role: {
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  UsersRoles: {
    update: jest.fn(),
  },
  Payment: {
    findAndCountAll: jest.fn(),
  },
  Shipment: {},
}));
jest.mock('../../../src/config/redis', () => ({
  redisClient: {
    del: jest.fn(),
  },
}));
jest.mock('../../../src/helpers/aws.helper', () => ({
  uploadFileToS3: jest.fn(),
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      User.findOne.mockResolvedValue(null); // No existing user
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        addRole: jest.fn(), // Mock addRole method
      };
      User.create.mockResolvedValue(mockUser);
      Role.findOne.mockResolvedValue({ id: 2, name: 'Customer' });

      const result = await createUser({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'Password123!',
        phone_number: '1234567890',
      });

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(User.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'hashedPassword',
        phone_number: '1234567890',
      });
      expect(mockUser.addRole).toHaveBeenCalledWith({ id: 2, name: 'Customer' });
      expect(redisClient.del).toHaveBeenCalledWith('test@example.com_verified');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user already exists', async () => {
      User.findOne.mockResolvedValue({ id: 1 });

      await expect(createUser({ email: 'test@example.com', password: 'Password123!' })).rejects.toThrow(
        ApiError
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated user data', async () => {
      User.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john;@example.com',
            phone_number: '1234567890',
            created_at: new Date(),
            updated_at: new Date(),
            Roles: [{ name: 'Customer' }],
          },
          {
            id: 2,
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone_number: '0987654321',
            created_at: new Date(),
            updated_at: new Date(),
            Roles: [{ name: 'Admin' }],
          },
        ],
      });

      const result = await getAllUsers(1, 10);

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        include: {
          model: Role,
          through: { attributes: [] },
          attributes: ['name'],
        },
        offset: 0,
        limit: 10,
        order: [['created_at', 'DESC']],
      });
      expect(result.totalItems).toBe(2);
      expect(result.users).toHaveLength(2);
    });
  });

  describe('getUserById', () => {
    it('should return user details by ID', async () => {
      User.findByPk.mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        created_at: new Date(),
        updated_at: new Date(),
        Roles: [{ name: 'Customer' }],
      });

      const result = await getUserById(1);

      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ['password'] },
        include: { model: Role, through: { attributes: [] } },
      });
      expect(result).toHaveProperty('id', 1);
    });

    it('should throw error if user is not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(getUserById(1)).rejects.toThrow(ApiError);
    });
  });

  describe('deleteUserById', () => {
    it('should delete a user by ID', async () => {
      User.findByPk.mockResolvedValue({
        destroy: jest.fn().mockResolvedValue(),
      });

      const result = await deleteUserById(1);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should throw error if user is not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(deleteUserById(1)).rejects.toThrow(ApiError);
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      uploadFileToS3.mockResolvedValue('https://s3.amazonaws.com/document-url');
      User.update.mockResolvedValue([1]);

      const result = await uploadDocument('fileData', 1);

      expect(uploadFileToS3).toHaveBeenCalledWith('fileData', 1);
      expect(User.update).toHaveBeenCalledWith(
        { document_url: 'https://s3.amazonaws.com/document-url' },
        { where: { id: 1 } }
      );
      expect(result).toEqual({
        message: 'Document uploaded successfully.',
        documentUrl: 'https://s3.amazonaws.com/document-url',
      });
    });

    it('should throw error if user is not found', async () => {
      User.update.mockResolvedValue([0]);

      await expect(uploadDocument('fileData', 1)).rejects.toThrow(ApiError);
    });
  });

  describe('createUserByAdmin', () => {
    it('should create a user with specified roles successfully', async () => {
      const userData = {
        name: faker.name.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phone_number: faker.phone.number('+1-###-###-####'),
        roles: ['Admin', 'Customer'],
      };

      const hashedPassword = faker.internet.password();
      const mockRoleRecords = [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Customer' },
      ];
      const mockUser = { id: faker.number.int(), ...userData, addRoles: jest.fn() };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      Role.findAll.mockResolvedValue(mockRoleRecords);
      User.create.mockResolvedValue(mockUser);

      const result = await createUserByAdmin(userData);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(Role.findAll).toHaveBeenCalledWith({ where: { name: userData.roles } });
      expect(mockUser.addRoles).toHaveBeenCalledWith(mockRoleRecords);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if one or more roles do not exist', async () => {
      const userData = {
        name: faker.name.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phone_number: faker.phone.number('+1-###-###-####'),
        roles: ['InvalidRole'],
      };

      User.findOne.mockResolvedValue(null);
      Role.findAll.mockResolvedValue([]);

      await expect(createUserByAdmin(userData)).rejects.toThrow(ApiError);
      expect(Role.findAll).toHaveBeenCalledWith({ where: { name: userData.roles } });
    });
  });

  describe('updateUserById', () => {
    it('should update the user details successfully', async () => {
      const userId = faker.number.int();
      const updateData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone_number: faker.phone.number('+1-###-###-####'),
        password: 'newpassword123', // Updating the password
      };

      // This is the fixed, mock password hash to match the test expectations
      const fixedHashedPassword = 'iMBFvwGAuyOV2F4';

      // Mock the user and related methods
      const mockUser = { id: userId, ...updateData };

      // Mocking model methods
      User.findByPk.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue(fixedHashedPassword); // Always return the fixed hash
      User.update.mockResolvedValue([1, [mockUser]]);

      // Run the function
      const result = await updateUserById(userId, updateData);

      // Assert that bcrypt.hash was called with the correct arguments
      expect(bcrypt.hash).toHaveBeenCalledWith(updateData.password, 10);

      // Assert that User.update was called with the expected parameters
      expect(User.update).toHaveBeenCalledWith(
        { ...updateData, password: fixedHashedPassword }, // Ensure the mock hash is used
        { where: { id: userId }, returning: true, individualHooks: true }
      );

      // Check the result is correct
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user is not found', async () => {
      const userId = faker.number.int();
      const updateData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      User.findByPk.mockResolvedValue(null);

      await expect(updateUserById(userId, updateData)).rejects.toThrow(ApiError);
    });
  });

  describe('getPaymentsByUserId', () => {
    it('should return paginated payments for a user', async () => {
      const userId = faker.number.int();
      const mockPayments = {
        count: 2,
        rows: [
          { id: faker.number.int(), amount: faker.finance.amount() },
          { id: faker.number.int(), amount: faker.finance.amount() },
        ],
      };

      Payment.findAndCountAll.mockResolvedValue(mockPayments);

      const result = await getPaymentsByUserId(userId, 1, 2);

      expect(Payment.findAndCountAll).toHaveBeenCalledWith({
        where: { user_id: userId },
        include: [{ model: expect.anything(), as: 'Shipment', attributes: ['id', 'status'] }],
        limit: 2,
        offset: 0,
        order: [['created_at', 'DESC']],
      });
      expect(result).toEqual({
        total: mockPayments.count,
        pages: 1,
        currentPage: 1,
        data: mockPayments.rows,
      });
    });
  });

  describe('verifyUserDocument', () => {
    it('should verify the user document successfully', async () => {
      const userId = faker.number.int();
      const mockUser = {
        id: userId,
        document_url: faker.internet.url(),
        is_document_verified: false,
        save: jest.fn(),
      };

      User.findByPk.mockResolvedValue(mockUser);

      const result = await verifyUserDocument(userId);

      expect(User.findByPk).toHaveBeenCalledWith(userId);
      expect(mockUser.is_document_verified).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if the user does not have a document URL', async () => {
      const userId = faker.number.int();
      const mockUser = { id: userId, document_url: null };

      User.findByPk.mockResolvedValue(mockUser);

      await expect(verifyUserDocument(userId)).rejects.toThrow(ApiError);
    });
  });
});
