const jwt = require('jsonwebtoken');


exports.signToken = payload => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
exports.verifyToken = token => jwt.verify(token, process.env.JWT_SECRET);