module.exports = (sequelize, DataTypes) => {
  class Rate extends sequelize.Sequelize.Model {
    static associate(models) {
      Rate.hasMany(models.Shipment, { foreignKey: 'rate_id' });
    }
  }

  Rate.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      city_tier: {
        type: DataTypes.ENUM('Tier1', 'Tier2', 'Tier3', 'Tier4'),
        allowNull: false,
      },
      base_rate: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      fragile_multiplier: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      weight_multiplier: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      size_multiplier: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      delivery_option_multiplier: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Rate',
      tableName: 'rates',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Rate;
};
