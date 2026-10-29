const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Blocks the request unless a valid "Authorization: Bearer <token>" header is sent.
async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ message: 'Account no longer exists.' });
    req.user = { id: user._id.toString(), name: user.name };
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

module.exports = { protect };
