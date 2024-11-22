const {
  createShipment,
  getShipments,
  getShipmentById,
  getShipmentStatuses,
  updateShipment,
  deleteShipment,
  updateShipmentStatus,
  assignDeliveryAgent,
  sendShipmentReminders,
  rescheduleShipment,
} = require('../../../src/services/shipments.service');
const { Shipment, Rate, User, Status, Role } = require('../../../src/models');
const {
  extractCityFromAddress,
  getCityTier,
  calculatePrice,
} = require('../../../src/helpers/shipments.helper');
const { sendEmail } = require('../../../src/helpers/email.helper');
const { ApiError } = require('../../../src/helpers/response.helper');
const { Op } = require('sequelize');

jest.mock('../../../src/models');
jest.mock('../../../src/helpers/shipments.helper');
jest.mock('../../../src/helpers/email.helper');

describe('Shipments Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createShipment', () => {
    it('should create a shipment successfully', async () => {
      const shipmentData = { delivery_address: '123 Main St', weight: 10 };
      const userId = 'user1';

      extractCityFromAddress.mockResolvedValue('New York');
      getCityTier.mockReturnValue('Tier 1');
      Rate.findOne.mockResolvedValue({ id: 1, city_tier: 'Tier 1' });
      calculatePrice.mockReturnValue(100);
      Shipment.create.mockResolvedValue({ id: 'shipment1', price: 100 });

      const result = await createShipment(shipmentData, userId);

      expect(extractCityFromAddress).toHaveBeenCalledWith('123 Main St');
      expect(getCityTier).toHaveBeenCalledWith('New York');
      expect(Rate.findOne).toHaveBeenCalledWith({ where: { city_tier: 'Tier 1' } });
      expect(Shipment.create).toHaveBeenCalledWith(expect.objectContaining({ user_id: userId, price: 100 }));
      expect(result.id).toBe('shipment1');
    });

    it('should throw an error if no rate is found for the city tier', async () => {
      extractCityFromAddress.mockResolvedValue('New York');
      getCityTier.mockReturnValue('Tier 1');
      Rate.findOne.mockResolvedValue(null);

      await expect(createShipment({ delivery_address: '123 Main St' }, 'user1')).rejects.toThrow(
        new ApiError(404, 'No rate found for city tier Tier 1')
      );

      expect(Rate.findOne).toHaveBeenCalledWith({ where: { city_tier: 'Tier 1' } });
    });
  });

  describe('getShipments', () => {
    it('should return paginated shipments', async () => {
      Shipment.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: [{ id: 1 }, { id: 2 }],
      });

      const result = await getShipments({}, 1, 10);

      expect(Shipment.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, offset: 0 })
      );
      expect(result.totalItems).toBe(2);
      expect(result.shipments.length).toBe(2);
    });
  });

  describe('getShipmentById', () => {
    it('should return a shipment by ID', async () => {
      Shipment.findByPk.mockResolvedValue({ id: 'shipment1' });

      const result = await getShipmentById('shipment1');

      expect(Shipment.findByPk).toHaveBeenCalledWith('shipment1', expect.any(Object));
      expect(result.id).toBe('shipment1');
    });

    it('should throw an error if the shipment is not found', async () => {
      Shipment.findByPk.mockResolvedValue(null);

      await expect(getShipmentById('shipment1')).rejects.toThrow(
        new ApiError(404, 'No shipment found with ID shipment1')
      );
    });
  });

  describe('updateShipment', () => {
    it('should update a shipment successfully', async () => {
      const shipmentData = { delivery_address: '456 Elm St', weight: 20 };

      Shipment.findByPk.mockResolvedValue({
        id: 'shipment1',
        toJSON: jest.fn().mockReturnValue({ id: 'shipment1' }),
      });
      extractCityFromAddress.mockResolvedValue('San Francisco');
      getCityTier.mockReturnValue('Tier 2');
      Rate.findOne.mockResolvedValue({ id: 2, city_tier: 'Tier 2' });
      calculatePrice.mockReturnValue(200);
      Shipment.update.mockResolvedValue([1, [{ id: 'shipment1', price: 200 }]]);

      const result = await updateShipment('shipment1', shipmentData);

      expect(Shipment.update).toHaveBeenCalledWith(
        expect.objectContaining({ price: 200 }),
        expect.any(Object)
      );
      expect(result.id).toBe('shipment1');
    });

    it('should throw an error if the shipment does not exist', async () => {
      Shipment.findByPk.mockResolvedValue(null);

      await expect(updateShipment('shipment1', {})).rejects.toThrow(
        new ApiError(404, 'No shipment found with ID shipment1')
      );
    });
  });

  describe('deleteShipment', () => {
    it('should delete a shipment if the user is an admin', async () => {
      Shipment.findByPk.mockResolvedValue({ id: 'shipment1', user_id: 'user1', destroy: jest.fn() });
      const user = { id: 'user2', Roles: [{ name: 'Admin' }] };

      const result = await deleteShipment('shipment1', user);

      expect(Shipment.findByPk).toHaveBeenCalledWith('shipment1');
      expect(result).toBe(true);
    });

    it('should throw an error if the user is not authorized', async () => {
      Shipment.findByPk.mockResolvedValue({ id: 'shipment1', user_id: 'user1', destroy: jest.fn() });
      const user = { id: 'user2', Roles: [] };

      await expect(deleteShipment('shipment1', user)).rejects.toThrow(
        new ApiError(403, 'Access denied. Insufficient permissions.')
      );
    });
  });

  describe('sendShipmentReminders', () => {
    it('should send reminders for pending shipments', async () => {
      // Mock Shipment.findAll to return a shipment with a preferred_delivery_date
      Shipment.findAll.mockResolvedValue([
        {
          id: 'shipment1',
          status: 'Pending',
          user: { name: 'User', email: 'user@example.com' },
          preferred_delivery_date: new Date('2024-12-01'),
          save: jest.fn(),
        },
      ]);

      // Mock sendEmail to resolve successfully
      sendEmail.mockResolvedValue();

      await sendShipmentReminders();

      // Check if the sendEmail function was called with the correct data
      expect(Shipment.findAll).toHaveBeenCalledWith(expect.any(Object));
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          data: expect.objectContaining({
            shipment: expect.objectContaining({
              deliveryDate: 'Sun Dec 01 2024', // The date should match the mock date
            }),
          }),
        })
      );
    });

    it('should log if no shipments require reminders', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      Shipment.findAll.mockResolvedValue([]);

      await sendShipmentReminders();

      expect(consoleSpy).toHaveBeenCalledWith('No pending shipments require reminders.');
      consoleSpy.mockRestore();
    });
  });
});
