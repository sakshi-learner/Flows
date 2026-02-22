const db = require("../models");
const User = db.User;
const { Op } = db.Sequelize;

// Create user
const createUser = async ({ name, email, password, role, isActive }) => {
  console.log("name, email, password, role, isActive from user repository",name, email, password, role, isActive)
  return await User.create({ name, email, password, role, isActive });
  
};

// Find user by email
const findUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

const findUserById = (id) => {
  return User.findByPk(id, {
    attributes: ["id", "name", "email", "role"],
  });
};

const getAllUsersExcept = async (userId) => {
  return await User.findAll({
    where: { id: { [Op.ne]: userId } },
    attributes: ["id", "name", "email", "role"],
  });
};

// ✅ aliases so other modules can use consistent names
const create = (data) => createUser(data);
const findByEmail = (email) => findUserByEmail(email);

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsersExcept,

  // ✅ aliases
  create,
  findByEmail,
};
