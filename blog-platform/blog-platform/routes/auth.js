const router = require('express').Router();
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters.'),
    body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email address.'),
    body('password').isLength({ min: 6, max: 72 }).withMessage('Password must be 6-72 characters.')
  ],
  validate,
  async (req, res) => {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'That email is already registered.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  validate,
  async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    const ok = user && (await bcrypt.compare(req.body.password, user.password));
    if (!ok) return res.status(401).json({ message: 'Invalid email or password.' });
    res.json({ token: signToken(user), user: publicUser(user) });
  }
);

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ user: publicUser(user) });
});

module.exports = router;
