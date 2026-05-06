const mongoose = require('mongoose');
require('dotenv').config();
const Post = require('./models/Post');
const fs = require('fs');
const path = require('path');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/instagram-clone')
    .then(async () => {
        const posts = await Post.find().sort({ createdAt: -1 }).limit(5);
        fs.writeFileSync('posts_dump.json', JSON.stringify(posts, null, 2));
        console.log('Dumped to posts_dump.json');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
