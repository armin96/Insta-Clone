const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/stories/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit (updated for videos)
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed for stories'));
        }
    }
});

// Get all active stories from users you follow
router.get('/', authMiddleware, async (req, res) => {
    try {
        const User = require('../models/User');
        const currentUser = await User.findById(req.userId);

        // Get stories from users you follow + your own stories
        const userIds = [...currentUser.following, req.userId];

        const stories = await Story.find({
            user: { $in: userIds },
            expiresAt: { $gt: new Date() }
        })
            .populate('user', 'username profilePic')
            .sort({ createdAt: -1 });

        // Group stories by user
        const groupedStories = {};
        stories.forEach(story => {
            const userId = story.user._id.toString();
            if (!groupedStories[userId]) {
                groupedStories[userId] = {
                    user: story.user,
                    stories: [],
                    hasUnviewed: false
                };
            }
            groupedStories[userId].stories.push(story);

            // Check if user has viewed this story
            if (!story.views.includes(req.userId)) {
                groupedStories[userId].hasUnviewed = true;
            }
        });

        res.json(Object.values(groupedStories));
    } catch (error) {
        console.error('Get stories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new story
router.post('/', authMiddleware, upload.single('media'), async (req, res) => {
    try {
        const imagePath = req.file ? `/uploads/stories/${req.file.filename}` : null;
        const mediaType = req.file && req.file.mimetype.startsWith('video/') ? 'video' : 'image';

        if (!imagePath) {
            return res.status(400).json({ message: 'Media file is required' });
        }

        const story = new Story({
            user: req.userId,
            image: imagePath,
            mediaType
        });

        await story.save();
        await story.populate('user', 'username profilePic');

        res.status(201).json(story);
    } catch (error) {
        console.error('Create story error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark story as viewed
router.post('/:id/view', authMiddleware, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        if (!story.views.includes(req.userId)) {
            story.views.push(req.userId);
            await story.save();
        }

        res.json({ message: 'Story viewed' });
    } catch (error) {
        console.error('View story error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a story
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        if (story.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await story.deleteOne();
        res.json({ message: 'Story deleted' });
    } catch (error) {
        console.error('Delete story error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
