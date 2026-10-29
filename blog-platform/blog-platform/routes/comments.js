const router = require('express').Router();
const { body, param } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

// GET /api/posts/:postId/comments
router.get(
  '/posts/:postId/comments',
  param('postId').isMongoId().withMessage('Invalid post ID.'),
  validate,
  async (req, res) => {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('author', 'name');
    res.json(comments);
  }
);

// POST /api/posts/:postId/comments
router.post(
  '/posts/:postId/comments',
  protect,
  [
    param('postId').isMongoId().withMessage('Invalid post ID.'),
    body('text').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be 1-1000 characters.')
  ],
  validate,
  async (req, res) => {
    if (!(await Post.exists({ _id: req.params.postId }))) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    const comment = await Comment.create({ post: req.params.postId, author: req.user.id, text: req.body.text });
    await comment.populate('author', 'name');
    res.status(201).json(comment);
  }
);

// DELETE /api/comments/:id (comment author only)
router.delete(
  '/comments/:id',
  protect,
  param('id').isMongoId().withMessage('Invalid comment ID.'),
  validate,
  async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own comments.' });
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted.' });
  }
);

module.exports = router;
