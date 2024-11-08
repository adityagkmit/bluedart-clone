'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = sequelize => {
  class Shipment extends Model {
    static associate(models) {
      Shipment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Shipment.belongsTo(models.Rate, { foreignKey: 'rate_id', as: 'rate' });
      Shipment.hasMany(models.Status, { foreignKey: 'shipment_id', as: 'statuses' });
    }
  }

  Shipment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      pickup_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      delivery_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      weight: {
        type: DataTypes.REAL,
        allowNull: false,
      },
      dimensions: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      is_fragile: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      delivery_option: {
        type: DataTypes.ENUM('Standard', 'Express'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'In Transit', 'Out for Delivery', 'Delivered'),
        defaultValue: 'Pending',
      },
      rate_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      preferred_delivery_date: {
        type: DataTypes.DATE,
      },
      preferred_delivery_time: {
        type: DataTypes.TIME,
      },
      delivery_agent_id: {
        type: DataTypes.UUID,
      },
    },
    {
      sequelize,
      modelName: 'Shipment',
      tableName: 'shipments',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Shipment;
};
