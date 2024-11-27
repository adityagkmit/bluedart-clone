const {
  toCamelCase,
  normalizeTimestamps,
  removeCircularReferences,
} = require('../../../src/helpers/serializer.helper');
const _ = require('lodash');

describe('serializer.helper', () => {
  describe('toCamelCase', () => {
    it('should convert object keys to camelCase', () => {
      const data = {
        first_name: 'John',
        last_name: 'Doe',
        user_info: {
          address_line_1: '123 Main St',
          address_line_2: 'Apt 4B',
        },
      };

      const result = toCamelCase(data);

      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        userInfo: {
          addressLine1: '123 Main St',
          addressLine2: 'Apt 4B',
        },
      });
    });

    it('should handle circular references', () => {
      const data = { name: 'John' };
      data.self = data; // Circular reference

      const result = toCamelCase(data);

      expect(result).toEqual({ name: 'John', self: {} });
    });

    it('should handle arrays of objects', () => {
      const data = [
        { first_name: 'John', last_name: 'Doe' },
        { first_name: 'Jane', last_name: 'Smith' },
      ];

      const result = toCamelCase(data);

      expect(result).toEqual([
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Jane', lastName: 'Smith' },
      ]);
    });

    it('should return the same data for primitive types', () => {
      expect(toCamelCase('string')).toBe('string');
      expect(toCamelCase(42)).toBe(42);
      expect(toCamelCase(null)).toBeNull();
      expect(toCamelCase(undefined)).toBeUndefined();
    });
  });

  describe('normalizeTimestamps', () => {
    it('should normalize createdAt and updatedAt from snake_case to camelCase', () => {
      const data = {
        created_at: '2024-11-01T00:00:00Z',
        updated_at: '2024-11-10T00:00:00Z',
        name: 'John',
      };

      const result = normalizeTimestamps(data);
    });

    it('should handle missing created_at and updated_at fields gracefully', () => {
      const data = { name: 'John' };
      const result = normalizeTimestamps(data);

      expect(result).toEqual({
        createdAt: null,
        updatedAt: null,
        name: 'John',
      });
    });

    it('should return null if input data is null', () => {
      const result = normalizeTimestamps(null);
      expect(result).toBeNull();
    });
  });

  describe('removeCircularReferences', () => {
    it('should remove circular references', () => {
      const data = { name: 'John' };
      data.self = data; // Circular reference

      const result = removeCircularReferences(data);

      expect(result).toEqual({ name: 'John' });
    });

    it('should handle arrays with circular references', () => {
      const data = [{ name: 'John' }];
      data[0].self = data; // Circular reference

      const result = removeCircularReferences(data);

      expect(result).toEqual([{ name: 'John' }]);
    });

    it('should return the same object if no circular references are present', () => {
      const data = { name: 'John' };
      const result = removeCircularReferences(data);

      expect(result).toEqual({ name: 'John' });
    });

    it('should handle nested circular references', () => {
      const data = { name: 'John' };
      const nested = { self: data };
      data.nested = nested;
      nested.self = data; // Circular reference

      const result = removeCircularReferences(data);

      expect(result).toEqual({ name: 'John', nested: {} });
    });

    it('should return the original object for non-circular objects', () => {
      const data = { a: 1, b: 2, c: 3 };
      const result = removeCircularReferences(data);

      expect(result).toEqual(data);
    });
  });
});
