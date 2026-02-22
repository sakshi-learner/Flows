const userService = require("../services/user.services");
const userRepo = require("../repositories/user.repository");

// Existing addUser controller
const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await userService.addUser(name, email, password, role);
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


const getUserList = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT auth middleware
    const users = await userRepo.getAllUsersExcept(userId);
    res.json(users);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addUser, getUserList };