const router = require('express').Router();
const { body, param } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const idRule = param('id').isMongoId().withMessage('Invalid post ID.');
const postRules = [
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters.'),
  body('description').trim().isLength({ min: 10, max: 250 }).withMessage('Description must be 10-250 characters.'),
  body('content').trim().isLength({ min: 20, max: 20000 }).withMessage('Content must be at least 20 characters.')
];

// Loads a post and makes sure the logged-in user owns it.
async function findOwnedPost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404).json({ message: 'Post not found.' });
    return null;
  }
  if (post.author.toString() !== req.user.id) {
    res.status(403).json({ message: 'You can only change your own posts.' });
    return null;
  }
  return post;
}

// GET /api/posts - all posts, newest first (full content is left out of the list)
router.get('/', async (req, res) => {
  const posts = await Post.find().select('-content').sort({ createdAt: -1 }).populate('author', 'name');
  res.json(posts);
});

// GET /api/posts/:id
router.get('/:id', idRule, validate, async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name');
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  res.json(post);
});

// POST /api/posts
router.post('/', protect, postRules, validate, async (req, res) => {
  const { title, description, content } = req.body;
  const post = await Post.create({ title, description, content, author: req.user.id });
  res.status(201).json(post);
});

// PUT /api/posts/:id (owner only)
router.put('/:id', protect, idRule, postRules, validate, async (req, res) => {
  const post = await findOwnedPost(req, res);
  if (!post) return;
  const { title, description, content } = req.body;
  Object.assign(post, { title, description, content });
  await post.save();
  res.json(post);
});

// DELETE /api/posts/:id (owner only) - also removes the post's comments
router.delete('/:id', protect, idRule, validate, async (req, res) => {
  const post = await findOwnedPost(req, res);
  if (!post) return;
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  res.json({ message: 'Post deleted.' });
});

module.exports = router;
