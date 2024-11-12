const userService = require('../services/users.service');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const newUser = await userService.createUserByAdmin(req.body);
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await userService.updateUserById(userId, req.body);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found or no changes made' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await userService.deleteUserById(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    // Log the error and return a 400 status for client errors
    console.error('Error deleting user:', error.message);
    res.status(400).json({ error: error.message });
  }
};
