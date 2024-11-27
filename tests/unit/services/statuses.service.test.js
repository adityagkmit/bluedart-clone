const { createStatus, getStatusById } = require('../../../src/services/statuses.service');
const { Status, Shipment, User, Role } = require('../../../src/models');
const { ApiError } = require('../../../src/helpers/response.helper');
const { sendShipmentStatusUpdateEmail } = require('../../../src/helpers/email.helper');

// Mock the entire email helper module
jest.mock('../../../src/helpers/email.helper', () => ({
  sendShipmentStatusUpdateEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../src/models');

describe('statusesService.createStatus', () => {
  let mockUser;
  let mockShipment;
  let mockTransaction;
  let mockEmailData;

  beforeEach(() => {
    mockUser = {
      id: 1,
      name: 'Test User',
      email: 'testuser@example.com',
      Roles: [{ name: 'Admin' }],
    };
    mockShipment = {
      id: 1,
      user_id: 1,
      delivery_agent_id: 2,
    };
    mockTransaction = null;
    mockEmailData = {
      userName: mockUser.name,
      shipmentId: mockShipment.id,
      status: 'Shipped',
    };

    // Mocking the models and methods used in createStatus
    Shipment.findByPk = jest.fn().mockResolvedValue(mockShipment);
    Status.create = jest.fn().mockResolvedValue({ id: 1, shipment_id: mockShipment.id, name: 'Shipped' });
  });

  it('should create a shipment status successfully', async () => {
    const data = { shipmentId: 1, name: 'Shipped' };

    const result = await createStatus(data, mockUser, mockTransaction);

    expect(result).toHaveProperty('shipment_id', mockShipment.id);
    expect(result).toHaveProperty('name', 'Shipped');
    expect(Status.create).toHaveBeenCalledTimes(1);
    expect(sendShipmentStatusUpdateEmail).toHaveBeenCalledWith(mockUser.email, mockEmailData);
  });

  it('should throw an error if the shipment is not found', async () => {
    Shipment.findByPk.mockResolvedValue(null); // Mocking not found shipment

    const data = { shipmentId: 999, name: 'Shipped' };

    await expect(createStatus(data, mockUser, mockTransaction)).rejects.toThrow(
      new ApiError(404, 'Shipment not found')
    );
  });

  it('should throw an error if the user is not authorized to update the status', async () => {
    // Mock a user that does not have the 'Admin' role, nor is the owner or delivery agent of the shipment
    mockUser.Roles = [{ name: 'Customer' }]; // Simulate a Customer role

    const data = { shipmentId: 1, name: 'Shipped' };

    // Mocking a shipment that is not related to the user
    mockShipment.user_id = 2; // This will cause the user to not be the owner
    mockShipment.delivery_agent_id = 3; // This will cause the user to not be the delivery agent

    // Ensure that the shipment exists for the user to try and update
    Shipment.findByPk.mockResolvedValue(mockShipment);

    // Expect the action to throw an error with the message for unauthorized access
    await expect(createStatus(data, mockUser, mockTransaction)).rejects.toThrow(
      new ApiError(403, 'Access denied. You are not authorized to update the status for this shipment.')
    );
  });
});

describe('statusesService.getStatusById', () => {
  let mockStatus;
  let mockShipment;
  let mockUser;

  beforeEach(() => {
    mockShipment = { id: 1, user_id: 1, delivery_agent_id: 2 };
    mockStatus = { id: 1, name: 'Shipped', Shipment: mockShipment };
    mockUser = {
      id: 1,
      roles: ['Admin'],
    };

    // Mocking the models and methods used in getStatusById
    Status.findByPk = jest.fn().mockResolvedValue(mockStatus);
  });

  it('should return the status when the user is an Admin', async () => {
    const data = { id: 1 };
    const result = await getStatusById(data, mockUser);

    expect(result).toEqual(mockStatus);
    expect(Status.findByPk).toHaveBeenCalledWith(data.id, {
      include: [{ model: Shipment, attributes: ['id', 'user_id', 'delivery_agent_id'] }],
    });
  });

  it('should return the status when the user is the owner (Customer)', async () => {
    mockUser.roles = ['Customer']; // Mocking a Customer role
    const data = { id: 1 };
    const result = await getStatusById(data, mockUser);

    expect(result).toEqual(mockStatus);
  });

  it('should throw an error if the user is not authorized to view the status of the shipment', async () => {
    mockUser.roles = ['Customer']; // Mocking a Customer role but with no permission

    const data = { id: 1 };
    mockShipment.user_id = 2; // Mocking different user_id on shipment

    await expect(getStatusById(data, mockUser)).rejects.toThrow(
      new ApiError(403, 'Access denied. You can only view statuses for your shipments.')
    );
  });

  it('should return the status when the user is a Delivery Agent assigned to the shipment', async () => {
    mockUser.roles = ['Delivery Agent'];
    mockShipment.delivery_agent_id = 1; // User is the delivery agent for the shipment

    const data = { id: 1 };
    const result = await getStatusById(data, mockUser);

    expect(result).toEqual(mockStatus);
  });

  it('should throw an error if the user is a Delivery Agent but not assigned to the shipment', async () => {
    mockUser.roles = ['Delivery Agent'];
    mockShipment.delivery_agent_id = 2; // User is not the delivery agent for the shipment

    const data = { id: 1 };

    await expect(getStatusById(data, mockUser)).rejects.toThrow(
      new ApiError(403, 'Access denied. You can only view statuses for shipments you are assigned to.')
    );
  });

  it('should throw an error if the status is not found', async () => {
    Status.findByPk.mockResolvedValue(null); // Mocking status not found

    const data = { id: 999 };

    await expect(getStatusById(data, mockUser)).rejects.toThrow(new ApiError(404, 'Status not found'));
  });
});
