'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = sequelize => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Shipment, { foreignKey: 'shipment_id' });
      Payment.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      shipment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'shipments',
          key: 'id',
        },
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      method: {
        type: DataTypes.ENUM('Online', 'COD'),
        defaultValue: 'Online',
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
        defaultValue: 'Pending',
      },
      transaction_details: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'payments',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Payment;
};
