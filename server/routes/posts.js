const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/posts/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed'));
        }
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate('user', 'username profilePic')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json(posts);
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const { processVideo } = require('../utils/videoProcessor');

// Create a post
router.post('/', authMiddleware, upload.single('media'), async (req, res) => {
    try {
        const { caption } = req.body;
        let imagePath = req.file ? `/uploads/posts/${req.file.filename}` : null;
        const mediaType = req.file && req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        let thumbnailPath = null;

        if (!imagePath) {
            return res.status(400).json({ message: 'Media file is required' });
        }

        // Process video if applicable
        if (mediaType === 'video') {
            try {
                const processed = await processVideo(imagePath);
                // We use the compressed video path for the post
                // Original file remains but we serve the better one
                imagePath = processed.videoPath.startsWith('/') ? processed.videoPath : `/${processed.videoPath}`;
                thumbnailPath = processed.thumbnailPath.startsWith('/') ? processed.thumbnailPath : `/${processed.thumbnailPath}`;
            } catch (ffmpegErr) {
                console.error('FFmpeg processing failed, using original:', ffmpegErr);
                // Continue with original if processing fails
            }
        }

        const post = new Post({
            user: req.userId,
            image: imagePath,
            mediaType,
            thumbnail: thumbnailPath,
            caption
        });

        await post.save();
        await post.populate('user', 'username profilePic');

        res.status(201).json(post);
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Like/Unlike a post
router.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.userId);

        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(req.userId);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a post
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a comment to a post
router.post('/:id/comment', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = {
            user: req.userId,
            text: text.trim(),
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        // Populate the user info for the new comment
        await post.populate('comments.user', 'username profilePic');

        // Return the newly added comment
        const newComment = post.comments[post.comments.length - 1];

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('comments.user', 'username profilePic')
            .select('comments');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post.comments);
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Save/Unsave a post
router.post('/:id/save', authMiddleware, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.userId);
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const isSaved = user.savedPosts.includes(req.params.id);

        if (isSaved) {
            // Unsave
            user.savedPosts = user.savedPosts.filter(
                id => id.toString() !== req.params.id
            );
        } else {
            // Save
            user.savedPosts.push(req.params.id);
        }

        await user.save();

        res.json({
            isSaved: !isSaved,
            savedPosts: user.savedPosts
        });
    } catch (error) {
        console.error('Save post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
