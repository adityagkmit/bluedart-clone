const userService = require('../../../src/services/users.service');
const { User, Role, UsersRoles, Payment, Shipment, Status } = require('../../../src/models');
const { ApiError } = require('../../../src/helpers/response.helper');
const { uploadFileToS3 } = require('../../../src/helpers/aws.helper');
const bcrypt = require('bcryptjs');

jest.mock('../../../src/models');
jest.mock('../../../src/helpers/aws.helper');
jest.mock('bcryptjs');

describe('User Service', () => {
  let mockUser;
  let mockRole;
  let mockPassword;
  let mockFile;
  let mockDocumentUrl;

  beforeEach(() => {
    mockPassword = 'Password123!';
    mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: bcrypt.hashSync(mockPassword, 10),
      phone_number: '1234567890',
      document_url: '',
      is_document_verified: false,
      addRole: jest.fn(),
      addRoles: jest.fn(),
      destroy: jest.fn(),
      save: jest.fn(),
      Roles: [{ name: 'Customer' }],
    };

    mockRole = {
      id: 1,
      name: 'Customer',
    };

    mockFile = { fieldname: 'file', originalname: 'document.pdf' };
    mockDocumentUrl = 'https://s3.amazonaws.com/documents/document.pdf';

    bcrypt.hash = jest.fn().mockResolvedValue(mockPassword);
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    uploadFileToS3.mockResolvedValue(mockDocumentUrl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      Role.findOne.mockResolvedValue(mockRole);
      User.findOne.mockResolvedValue(null); // User does not exist

      User.create.mockResolvedValue(mockUser);
      mockUser.addRole.mockResolvedValue(true);

      const result = await userService.createUser({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        phoneNumber: '1234567890',
      });

      expect(result).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' },
        include: {
          model: Role,
          as: 'Roles',
          attributes: ['id', 'name'],
        },
      });
      expect(mockUser.addRole).toHaveBeenCalledWith(mockRole);
    });

    it('should throw error if role not found', async () => {
      Role.findOne.mockResolvedValue(null); // Role does not exist

      await expect(
        userService.createUser({
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          phoneNumber: '1234567890',
        })
      ).rejects.toThrowError(
        new ApiError(404, 'Customer role not found. Ensure roles are seeded in the database.')
      );
    });

    it('should throw error if user already has the role', async () => {
      Role.findOne.mockResolvedValue(mockRole);
      User.findOne.mockResolvedValue(mockUser); // User exists

      await expect(
        userService.createUser({
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          phoneNumber: '1234567890',
        })
      ).rejects.toThrowError(
        new ApiError(400, `User with email 'john.doe@example.com' already has the 'Customer' role.`)
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated list of users', async () => {
      const users = [mockUser];
      User.findAndCountAll.mockResolvedValue({ count: 1, rows: users });

      const result = await userService.getAllUsers({ page: 1, limit: 10 });

      expect(result).toEqual({
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        users: [
          {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            phone_number: mockUser.phone_number,
            document_url: mockUser.document_url,
            created_at: mockUser.created_at,
            updated_at: mockUser.updated_at,
            roles: ['Customer'],
          },
        ],
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      User.findByPk.mockResolvedValue(mockUser);

      const result = await userService.getUserById(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        phone_number: mockUser.phone_number,
        document_url: mockUser.document_url,
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
        roles: ['Customer'],
      });
    });

    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(userService.getUserById(mockUser.id)).rejects.toThrowError(
        new ApiError(404, 'User not found')
      );
    });
  });

  describe('createUserByAdmin', () => {
    it('should create user with specified roles', async () => {
      Role.findOne.mockResolvedValue(mockRole);
      Role.findAll.mockResolvedValue([mockRole]);
      User.findOne.mockResolvedValue(null);

      User.create.mockResolvedValue(mockUser);
      mockUser.addRoles.mockResolvedValue(true);

      const result = await userService.createUserByAdmin({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'Password123!',
        phoneNumber: '9876543210',
        roles: ['Customer'],
      });

      expect(result).toEqual(mockUser);
      expect(mockUser.addRoles).toHaveBeenCalledWith([mockRole]);
    });

    it('should throw error if one or more roles do not exist', async () => {
      Role.findAll.mockResolvedValue([]); // No roles found

      await expect(
        userService.createUserByAdmin({
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          password: 'Password123!',
          phoneNumber: '9876543210',
          roles: ['NonExistingRole'],
        })
      ).rejects.toThrowError(new ApiError(400, 'One or more specified roles do not exist'));
    });

    it('should throw error if user already exists', async () => {
      User.findOne.mockResolvedValue(mockUser); // User exists

      await expect(
        userService.createUserByAdmin({
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          password: 'Password123!',
          phoneNumber: '9876543210',
          roles: ['Customer'],
        })
      ).rejects.toThrowError(new ApiError(400, 'User already exists'));
    });
  });

  describe('updateUserById', () => {
    it('should update user successfully', async () => {
      // Mock response for update
      const updatedUser = { ...mockUser, phone_number: '1112223333', password: 'Password123!' };
      User.update.mockResolvedValue([1, [updatedUser]]);

      const result = await userService.updateUserById(mockUser.id, {
        phoneNumber: '1112223333',
        password: 'NewPassword123!',
      });

      // Ensure that the result matches the updated user
      expect(result).toEqual(updatedUser);

      // Ensure User.update is called with the expected arguments
      expect(User.update).toHaveBeenCalledWith(
        {
          phone_number: '1112223333', // Ensure we use 'phone_number' as the model uses this
          password: expect.any(String), // Match any string for the password
        },
        {
          where: { id: mockUser.id },
          returning: true,
          individualHooks: true,
        }
      );
    });

    it('should throw error if user not found or no changes made', async () => {
      User.update.mockResolvedValue([0, []]); // No rows updated

      await expect(
        userService.updateUserById(mockUser.id, {
          phoneNumber: '1112223333',
          password: 'NewPassword123!',
        })
      ).rejects.toThrowError(new ApiError(404, 'User not found or no changes made'));
    });
  });

  describe('deleteUserById', () => {
    it('should delete user by id', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      User.destroy.mockResolvedValue(true);
      UsersRoles.update.mockResolvedValue([1]);

      const result = await userService.deleteUserById(mockUser.id);

      expect(result).toBe(true);
      expect(User.findByPk).toHaveBeenCalledWith(mockUser.id);
      expect(UsersRoles.update).toHaveBeenCalledWith(
        { deleted_at: expect.any(Date) },
        { where: { user_id: mockUser.id }, individualHooks: true }
      );
    });

    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(userService.deleteUserById(mockUser.id)).rejects.toThrowError(
        new ApiError(404, 'User not found')
      );
    });
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      User.update.mockResolvedValue([1]);

      const result = await userService.uploadDocument(mockFile, mockUser.id);

      expect(result.documentUrl).toBe(mockDocumentUrl);
      expect(User.update).toHaveBeenCalledWith(
        { document_url: mockDocumentUrl },
        { where: { id: mockUser.id } }
      );
    });

    it('should throw error if user not found or document URL could not be updated', async () => {
      User.update.mockResolvedValue([0]); // No rows updated

      await expect(userService.uploadDocument(mockFile, mockUser.id)).rejects.toThrowError(
        new ApiError(404, 'User not found or document URL could not be updated')
      );
    });
  });

  describe('verifyUserDocument', () => {
    it('should verify user document successfully', async () => {
      mockUser.document_url = 'https://s3.amazonaws.com/documents/document.pdf'; // Document URL present
      User.findByPk.mockResolvedValue(mockUser);

      const result = await userService.verifyUserDocument(mockUser.id);

      expect(result.is_document_verified).toBe(true);
      expect(User.findByPk).toHaveBeenCalledWith(mockUser.id);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValue(null); // User not found

      await expect(userService.verifyUserDocument(mockUser.id)).rejects.toThrowError(
        new ApiError(404, 'User not found')
      );
    });

    it('should throw error if user document not found', async () => {
      mockUser.document_url = null; // No document URL

      User.findByPk.mockResolvedValue(mockUser);

      await expect(userService.verifyUserDocument(mockUser.id)).rejects.toThrowError(
        new ApiError(400, 'User document not found')
      );
    });

    it('should throw error if document is already verified', async () => {
      mockUser.is_document_verified = true; // Document already verified

      User.findByPk.mockResolvedValue(mockUser);

      await expect(userService.verifyUserDocument(mockUser.id)).rejects.toThrowError(
        new ApiError(409, 'User document not found')
      );
    });
  });
});
