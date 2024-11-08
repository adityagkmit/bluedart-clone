module.exports = (sequelize, DataTypes) => {
  class Role extends sequelize.Sequelize.Model {
    static associate(models) {
      Role.belongsToMany(models.User, {
        through: models.UsersRoles,
        foreignKey: 'role_id',
      });
    }
  }

  Role.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Role;
};
