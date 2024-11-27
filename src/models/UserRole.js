const { Model, DataTypes } = require('sequelize');

module.exports = sequelize => {
  class UserRole extends Model {}

  UserRole.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
      },
      role_id: {
        type: DataTypes.UUID,
        references: {
          model: 'roles',
          key: 'id',
        },
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'UserRole',
      tableName: 'users_roles',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return UserRole;
};
