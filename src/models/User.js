const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static associate(models) {
    User.hasMany(models.Shipment, { foreignKey: 'user_id' });
    User.hasMany(models.Payment, { foreignKey: 'user_id' });
    User.hasMany(models.Report, { foreignKey: 'user_id' });
    User.belongsToMany(models.Role, {
      through: models.UsersRoles,
      foreignKey: 'user_id',
    });
  }
}

module.exports = sequelize => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      document_url: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return User;
};
