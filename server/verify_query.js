const mongoose = require('mongoose');
require('dotenv').config();
const Post = require('./models/Post');
const User = require('./models/User'); // Required for population

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/instagram-clone')
    .then(async () => {
        console.log('Connected to DB');
        const posts = await Post.find().sort({ createdAt: -1 }).limit(5);
        console.log('--- Last 5 Posts ---');
        posts.forEach(p => {
            console.log(`ID: ${p._id}`);
            console.log(`Type: ${p.mediaType}`);
            console.log(`Image: ${p.image}`);
            console.log(`Thumbnail: ${p.thumbnail}`);
            console.log('-------------------');
        });
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
