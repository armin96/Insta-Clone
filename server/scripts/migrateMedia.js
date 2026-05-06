const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const Post = require('../models/Post');
const User = require('../models/User');
const Story = require('../models/Story');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/instagram-clone');
        console.log('Connected to MongoDB');

        // Helper to save base64 to file
        const saveBase64ToFile = (base64String, subfolder) => {
            if (!base64String || !base64String.startsWith('data:')) return null;

            const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) return null;

            const type = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const extension = type.split('/')[1];
            const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;
            const relativePath = `uploads/${subfolder}/${filename}`;
            const fullPath = path.join(__dirname, '..', relativePath);

            fs.writeFileSync(fullPath, buffer);
            return `/uploads/${subfolder}/${filename}`;
        };

        // Migrate Posts
        const posts = await Post.find({ image: { $regex: /^data:/ } });
        console.log(`Migrating ${posts.length} posts...`);
        let migratedCount = 0;
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            try {
                const filePath = saveBase64ToFile(post.image, 'posts');
                if (filePath) {
                    post.image = filePath;
                    await post.save();
                    migratedCount++;
                    console.log(`✓ Post ${i + 1}/${posts.length}: ${filePath}`);
                } else {
                    console.log(`✗ Post ${i + 1}/${posts.length}: Failed to convert`);
                }
                // Small delay to ensure unique timestamps
                await new Promise(resolve => setTimeout(resolve, 10));
            } catch (error) {
                console.error(`✗ Post ${i + 1}/${posts.length}: Error -`, error.message);
            }
        }
        console.log(`Successfully migrated ${migratedCount} out of ${posts.length} posts`);

        // Migrate User Profiles
        const users = await User.find({ profilePic: { $regex: /^data:/ } });
        console.log(`Migrating ${users.length} user profiles...`);
        for (const user of users) {
            const filePath = saveBase64ToFile(user.profilePic, 'profiles');
            if (filePath) {
                user.profilePic = filePath;
                await user.save();
            }
        }

        // Migrate Stories
        const stories = await Story.find({ image: { $regex: /^data:/ } });
        console.log(`Migrating ${stories.length} stories...`);
        for (const story of stories) {
            const filePath = saveBase64ToFile(story.image, 'stories');
            if (filePath) {
                story.image = filePath;
                await story.save();
            }
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
