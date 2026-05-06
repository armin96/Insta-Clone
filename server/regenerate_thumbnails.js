const mongoose = require('mongoose');
require('dotenv').config();
const Post = require('./models/Post');
const { processVideo } = require('./utils/videoProcessor');
const path = require('path');
const fs = require('fs');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/instagram-clone')
    .then(async () => {
        console.log('Connected to DB. Finding posts requires thumbnail regeneration...');
        // Find video posts with no thumbnail
        const posts = await Post.find({ mediaType: 'video', thumbnail: null });
        console.log(`Found ${posts.length} posts to process.`);

        for (const post of posts) {
            console.log(`Processing Post ID: ${post._id}`);
            if (!post.image) {
                console.log('Skipping: No image path');
                continue;
            }

            try {
                // image path is like /uploads/posts/...
                // processVideo expects relative path e.g. /uploads/posts/...
                // We need to strip leading slash if processVideo expects pure relative?
                // util expects: inputPath
                // const fullInputPath = path.join(__dirname, '..', inputPath);
                // if inputPath starts with /, it might be treated absolute on some systems or strict mode

                // Let's ensure inputPath is correct relative to server root
                const inputPath = post.image;

                const processed = await processVideo(inputPath);

                post.thumbnail = processed.thumbnailPath.startsWith('/') ? processed.thumbnailPath : `/${processed.thumbnailPath}`;
                await post.save();
                console.log(`[SUCCESS] Generated thumbnail: ${post.thumbnail}`);
            } catch (err) {
                console.error(`[FAIL] Could not generate thumbnail for ${post._id}:`, err.message);
            }
        }
        console.log('Done.');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
