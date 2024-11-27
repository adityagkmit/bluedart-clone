const shipmentsService = require('../../../src/services/shipments.service');
const { Shipment, Rate, User, Status } = require('../../../src/models');
const { ApiError } = require('../../../src/helpers/response.helper'); // Updated path for ApiError
const { sendEmail } = require('../../../src/helpers/email.helper');
const statusService = require('../../../src/services/statuses.service');
const {
  extractCityFromAddress,
  getCityTier,
  calculatePrice,
} = require('../../../src/helpers/shipments.helper');

// Mocks for dependencies
jest.mock('../../../src/models');
jest.mock('../../../src/helpers/email.helper');
jest.mock('../../../src/helpers/shipments.helper');
jest.mock('../../../src/services/statuses.service');

// Helper Functions Mocks
extractCityFromAddress.mockResolvedValue('CityName');
getCityTier.mockReturnValue(1);
calculatePrice.mockReturnValue(100);

// Suppress console.log output in tests
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('shipmentsService.createShipment', () => {
  const userId = 1;

  it('should successfully create a shipment', async () => {
    Rate.findOne.mockResolvedValue({ id: 1 });
    Shipment.create.mockResolvedValue({
      id: 1,
      user_id: userId,
      pickup_address: 'Pickup Address',
      delivery_address: 'Delivery Address',
      price: 100,
    });

    const data = {
      weight: 10,
      dimensions: '10x10x10',
      isFragile: false,
      deliveryOption: 'Standard',
      pickupAddress: 'Pickup Address',
      deliveryAddress: 'Delivery Address',
      preferredDeliveryDate: new Date(),
      preferredDeliveryTime: '10:00 AM',
    };

    const result = await shipmentsService.createShipment(data, userId);

    expect(result).toHaveProperty('id', 1);
    expect(result).toHaveProperty('price', 100);
  });

  it('should throw an error if no rate is found', async () => {
    Rate.findOne.mockResolvedValue(null);
    const data = { weight: 10, dimensions: '10x10x10', isFragile: false };

    await expect(shipmentsService.createShipment(data, userId)).rejects.toThrow(
      new ApiError(404, 'No rate found for city tier 1')
    );
  });
});

describe('shipmentsService.getShipments', () => {
  it('should return paginated shipments', async () => {
    Shipment.findAndCountAll.mockResolvedValue({
      count: 10,
      rows: [{ id: 1, user_id: 1 }],
    });

    const result = await shipmentsService.getShipments({ page: 1, limit: 10 });

    expect(result).toHaveProperty('totalItems', 10);
    expect(result).toHaveProperty('totalPages', 1);
    expect(result.shipments).toHaveLength(1);
  });
});

describe('shipmentsService.getShipmentById', () => {
  it('should return shipment by ID', async () => {
    const mockShipment = { id: 1, user_id: 1 };
    Shipment.findByPk.mockResolvedValue(mockShipment);

    const result = await shipmentsService.getShipmentById(1);

    expect(result).toHaveProperty('id', 1);
  });

  it('should throw an error if shipment not found', async () => {
    Shipment.findByPk.mockResolvedValue(null);

    await expect(shipmentsService.getShipmentById(1)).rejects.toThrow(
      new ApiError(404, 'No shipment found with ID 1')
    );
  });
});

describe('shipmentsService.updateShipmentStatus', () => {
  it('should update shipment status successfully', async () => {
    const mockShipment = {
      id: 1,
      status: 'Pending',
      save: jest.fn().mockResolvedValue(true),
    };

    Shipment.findByPk.mockResolvedValue(mockShipment);
    statusService.createStatus.mockResolvedValue(true);

    const result = await shipmentsService.updateShipmentStatus(
      { shipmentId: 1, status: 'Shipped' },
      { id: 1, Roles: [{ name: 'Admin' }] }
    );

    expect(result).toHaveProperty('status', 'Shipped');
  });

  it('should throw an error if shipment not found', async () => {
    Shipment.findByPk.mockResolvedValue(null);

    await expect(
      shipmentsService.updateShipmentStatus({ shipmentId: 1, status: 'Shipped' }, { id: 1 })
    ).rejects.toThrow(new ApiError(404, 'No shipment found with ID 1'));
  });
});

describe('shipmentsService.performActionOnShipment', () => {
  it('should perform updateStatus action', async () => {
    const data = { action: 'updateStatus', shipmentId: 1, status: 'Shipped' };
    const user = { Roles: [{ name: 'Admin' }] };

    // Mocking Shipment.findByPk to return a valid shipment object with ID 1
    const mockShipment = {
      id: 1,
      status: 'Pending',
      save: jest.fn().mockResolvedValue(true), // Mocking the save method
    };
    Shipment.findByPk.mockResolvedValue(mockShipment); // Ensuring findByPk returns this mock

    // Mocking the updateShipmentStatus method to prevent it from throwing
    shipmentsService.updateShipmentStatus = jest.fn().mockResolvedValue({ id: 1, status: 'Shipped' });

    const result = await shipmentsService.performActionOnShipment(data.shipmentId, data, user);

    expect(result).toHaveProperty('message', 'Shipment status updated successfully');
  });

  it('should throw an error for unauthorized action', async () => {
    const data = { action: 'assignAgent', shipmentId: 1, deliveryAgentId: 2 };
    const user = { Roles: [{ name: 'User' }] };

    await expect(shipmentsService.performActionOnShipment(data.shipmentId, data, user)).rejects.toThrow(
      new ApiError(403, 'Only Admins can assign delivery agents')
    );
  });
});

describe('shipmentsService.sendShipmentReminders', () => {
  it('should send reminders for pending shipments', async () => {
    Shipment.findAll.mockResolvedValue([
      {
        id: 1,
        user: { email: 'user@example.com', name: 'John Doe' },
        preferred_delivery_date: new Date('2024-12-01'),
      },
    ]);

    sendEmail.mockResolvedValue(true);

    await shipmentsService.sendShipmentReminders();

    expect(sendEmail).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
      })
    );
  });

  it('should log no shipments if none are pending', async () => {
    Shipment.findAll.mockResolvedValue([]);

    await shipmentsService.sendShipmentReminders();
  });
});
