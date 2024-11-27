const { getAllRoles } = require('../../../src/services/roles.service');
const { Role } = require('../../../src/models');

jest.mock('../../../src/models', () => ({
  Role: {
    findAll: jest.fn(),
  },
}));

describe('Roles Service', () => {
  describe('getAllRoles', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return all roles successfully', async () => {
      // Mock data
      const mockRoles = [
        { id: 1, name: 'Admin', description: 'Administrator role' },
        { id: 2, name: 'Customer', description: 'Customer role' },
      ];

      // Mock Role.findAll
      Role.findAll.mockResolvedValue(mockRoles);

      // Call the service function
      const result = await getAllRoles();

      // Assertions
      expect(Role.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'description'],
      });
      expect(result).toEqual(mockRoles);
    });

    it('should return an empty array if no roles are found', async () => {
      // Mock Role.findAll to return an empty array
      Role.findAll.mockResolvedValue([]);

      // Call the service function
      const result = await getAllRoles();

      // Assertions
      expect(Role.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'description'],
      });
      expect(result).toEqual([]);
    });

    it('should throw an error if Role.findAll fails', async () => {
      // Mock Role.findAll to throw an error
      const mockError = new Error('Database error');
      Role.findAll.mockRejectedValue(mockError);

      // Call the service function and expect an error
      await expect(getAllRoles()).rejects.toThrow('Database error');

      // Assertions
      expect(Role.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'description'],
      });
    });
  });
});
