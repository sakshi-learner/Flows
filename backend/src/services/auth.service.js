// services/auth.service.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/user.repository");

const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// ✅ always same payload
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
};

// ✅ single cookie writer (use everywhere)
const setAuthCookie = (res, token) => {

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,     
    sameSite: "lax",
    path: "/",
    
    maxAge: 1* 60 *60* 1000,
  });
  console.log("response cookie :", token);
};

const login = async (email, password) => {
  const user = await userRepo.findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // ✅ use same generator
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const verifyProfile = async (userId) => {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error("User not found");

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

module.exports = {
  login,
  verifyProfile,
  generateToken,
  setAuthCookie,
};
