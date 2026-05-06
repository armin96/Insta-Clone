const mongoose = require('mongoose');
const Post = require('./models/Post');
require('dotenv').config();

const fixPaths = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/instagram-clone');
        console.log('Connected to MongoDB');

        const posts = await Post.find({
            $or: [
                { image: /^\/\// },
                { thumbnail: /^\/\// }
            ]
        });

        console.log(`Found ${posts.length} posts with double-slash paths.`);

        for (const post of posts) {
            console.log(`Fixing post ${post._id}...`);
            if (post.image) post.image = post.image.replace(/\/+/g, '/');
            if (post.thumbnail) post.thumbnail = post.thumbnail.replace(/\/+/g, '/');
            await post.save();
        }

        console.log('All paths fixed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing paths:', err);
        process.exit(1);
    }
};

fixPaths();
