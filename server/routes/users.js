const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Search users - MUST be before /:username route
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === '') {
            return res.json([]);
        }

        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        })
            .select('username profilePic bio')
            .limit(20);

        res.json(users);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user profile by username
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password')
            .populate('followers', 'username profilePic')
            .populate('following', 'username profilePic');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const Post = require('../models/Post');
        const page = parseInt(req.query.postsPage) || 1;
        const limit = parseInt(req.query.postsLimit) || 12;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ user: user._id })
            .populate('user', 'username profilePic')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments({ user: user._id });

        res.json({ user, posts, totalPosts });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Follow/Unfollow a user
router.post('/:userId/follow', authMiddleware, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.userId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.params.userId === req.userId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const isFollowing = currentUser.following.includes(req.params.userId);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(
                id => id.toString() !== req.params.userId
            );
            userToFollow.followers = userToFollow.followers.filter(
                id => id.toString() !== req.userId
            );
        } else {
            // Follow
            currentUser.following.push(req.params.userId);
            userToFollow.followers.push(req.userId);
        }

        await currentUser.save();
        await userToFollow.save();

        res.json({
            isFollowing: !isFollowing,
            followersCount: userToFollow.followers.length,
            followingCount: currentUser.following.length
        });
    } catch (error) {
        console.error('Follow/Unfollow error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get followers list
router.get('/:userId/followers', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('followers', 'username profilePic bio');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.followers);
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get following list
router.get('/:userId/following', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('following', 'username profilePic bio');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.following);
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get followers and following lists (for backward compatibility)
router.get('/:userId/follow-lists', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('followers', 'username profilePic bio')
            .populate('following', 'username profilePic bio');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            followers: user.followers,
            following: user.following
        });
    } catch (error) {
        console.error('Get follow lists error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// ... existing routes ...

// Update user profile
router.put('/profile', authMiddleware, upload.single('profilePic'), async (req, res) => {
    console.log('PUT /api/users/profile - body:', req.body);
    try {
        const { username, bio } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if username is being changed and if it's already taken
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = username;
        }

        // Update bio if provided
        if (bio !== undefined) {
            user.bio = bio;
        }

        // Update profile picture if provided
        if (req.file) {
            user.profilePic = `/uploads/profiles/${req.file.filename}`;
        }

        await user.save();

        // Return user without password
        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.json(updatedUser);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
