const { Role } = require('../models');

const getAllRoles = async () => {
  const roles = await Role.findAll({
    attributes: ['id', 'name', 'description'],
  });
  return roles;
};

module.exports = {
  getAllRoles,
};
