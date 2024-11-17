module.exports = (sequelize, DataTypes) => {
  class Report extends sequelize.Sequelize.Model {
    static associate(models) {
      Report.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  Report.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('Shipment Report', 'Customer Report'),
        allowNull: false,
        defaultValue: 'Shipment Report',
      },
    },
    {
      sequelize,
      modelName: 'Report',
      tableName: 'reports',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Report;
};
