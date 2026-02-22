const authService = require("../services/auth.service");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { token, user } = await authService.login(email, password);

    // ✅ standard cookie setter (same for email login + facebook login)
    authService.setAuthCookie(res, token);

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    const msg = err.message || "Login failed";

    if (msg === "User not found") {
      return res.status(404).json({ success: false, message: msg });
    }
    if (msg === "Invalid credentials") {
      return res.status(401).json({ success: false, message: msg });
    }

    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyToken = async (req, res) => {
  try {
    const user = await authService.verifyProfile(req.user.id);

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    const msg = err.message || "Unauthorized";

    if (msg === "User not found") {
      return res.status(404).json({ success: false, message: msg });
    }

    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

const logout = async (req, res) => {
  // ✅ use same cookie name + options as setter (path "/")
  res.clearCookie("token", { path: "/" });
  return res.json({ success: true, message: "Logged out" });
};

const register = async (req, res) => {
  return res.status(501).json({ success: false, message: "Register not implemented" });
};

const refreshToken = async (req, res) => {
  return res.status(501).json({ success: false, message: "Refresh not implemented" });
};

module.exports = {
  login,
  register,
  logout,
  verifyToken,
  refreshToken,
};
