const mongoose = require('mongoose');
require('dotenv').config();
const Post = require('./models/Post');
const fs = require('fs');
const path = require('path');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/instagram-clone')
    .then(async () => {
        console.log('Connected to DB');
        const posts = await Post.find().sort({ createdAt: -1 }).limit(5);
        console.log('--- Last 5 Posts ---');
        for (const p of posts) {
            console.log(`ID: ${p._id}`);
            console.log(`Type: ${p.mediaType}`);
            console.log(`Image: ${p.image}`);
            console.log(`Thumbnail: ${p.thumbnail}`);

            // Check file existence
            if (p.thumbnail) {
                const fsPath = path.join(__dirname, p.thumbnail.startsWith('/') ? p.thumbnail.substring(1) : p.thumbnail);
                if (fs.existsSync(fsPath)) {
                    console.log(`[OK] Thumbnail file exists: ${fsPath} size: ${fs.statSync(fsPath).size}`);
                } else {
                    console.error(`[FAIL] Thumbnail file MISSING: ${fsPath}`);
                }
            } else {
                console.log('[WARN] No thumbnail path in DB');
            }
            console.log('-------------------');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
