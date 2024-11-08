const { Model, DataTypes } = require('sequelize');

module.exports = sequelize => {
  class Status extends Model {
    static associate(models) {
      Status.belongsTo(models.Shipment, { foreignKey: 'shipment_id' });
    }
  }

  Status.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      shipment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'shipments',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.ENUM('Pending', 'In Transit', 'Out for Delivery', 'Delivered'),
        defaultValue: 'Pending',
      },
    },
    {
      sequelize,
      modelName: 'Status',
      tableName: 'statuses',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Status;
};
