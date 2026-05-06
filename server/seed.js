const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
require('dotenv').config();

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/instagram-clone');
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Post.deleteMany({});
        console.log('Cleared existing data');

        // Create users
        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = await User.create([
            {
                username: 'john_doe',
                email: 'john@example.com',
                password: hashedPassword,
                bio: 'Photography enthusiast 📸',
                profilePic: 'https://i.pravatar.cc/150?img=12'
            },
            {
                username: 'jane_smith',
                email: 'jane@example.com',
                password: hashedPassword,
                bio: 'Travel blogger ✈️',
                profilePic: 'https://i.pravatar.cc/150?img=5'
            },
            {
                username: 'mike_wilson',
                email: 'mike@example.com',
                password: hashedPassword,
                bio: 'Food lover 🍕',
                profilePic: 'https://i.pravatar.cc/150?img=33'
            },
            {
                username: 'sarah_jones',
                email: 'sarah@example.com',
                password: hashedPassword,
                bio: 'Fitness & wellness coach 💪',
                profilePic: 'https://i.pravatar.cc/150?img=47'
            },
            {
                username: 'alex_brown',
                email: 'alex@example.com',
                password: hashedPassword,
                bio: 'Digital artist 🎨',
                profilePic: 'https://i.pravatar.cc/150?img=68'
            },
            {
                username: 'emma_davis',
                email: 'emma@example.com',
                password: hashedPassword,
                bio: 'Coffee addict ☕ | Book lover 📚',
                profilePic: 'https://i.pravatar.cc/150?img=20'
            },
            {
                username: 'chris_martin',
                email: 'chris@example.com',
                password: hashedPassword,
                bio: 'Adventure seeker 🏕️',
                profilePic: 'https://i.pravatar.cc/150?img=59'
            },
            {
                username: 'lisa_taylor',
                email: 'lisa@example.com',
                password: hashedPassword,
                bio: 'Fashion & style 👗',
                profilePic: 'https://i.pravatar.cc/150?img=31'
            }
        ]);

        console.log('Created users');

        // Create posts
        const posts = await Post.create([
            {
                user: users[0]._id,
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                caption: 'Beautiful mountain view! 🏔️ #nature #mountains',
                likes: [users[1]._id, users[2]._id, users[3]._id]
            },
            {
                user: users[1]._id,
                image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
                caption: 'Beach vibes 🌊☀️ Perfect day in paradise!',
                likes: [users[0]._id, users[4]._id]
            },
            {
                user: users[2]._id,
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
                caption: 'Delicious homemade pasta! 🍝 #foodie #cooking',
                likes: [users[0]._id, users[1]._id, users[5]._id]
            },
            {
                user: users[0]._id,
                image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
                caption: 'Nature at its finest 🌲 Lost in the forest',
                likes: [users[6]._id]
            },
            {
                user: users[1]._id,
                image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
                caption: 'Sunset in paradise 🌅 #travel #wanderlust',
                likes: [users[2]._id, users[3]._id, users[7]._id]
            },
            {
                user: users[3]._id,
                image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
                caption: 'Morning workout complete! 💪 #fitness #motivation',
                likes: [users[0]._id, users[4]._id, users[6]._id]
            },
            {
                user: users[4]._id,
                image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800',
                caption: 'New artwork in progress 🎨✨',
                likes: [users[1]._id, users[5]._id]
            },
            {
                user: users[5]._id,
                image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
                caption: 'Coffee and a good book ☕📖 Perfect Sunday!',
                likes: [users[2]._id, users[7]._id]
            },
            {
                user: users[6]._id,
                image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
                caption: 'Camping under the stars ⛺🌟 #adventure',
                likes: [users[0]._id, users[1]._id, users[3]._id]
            },
            {
                user: users[7]._id,
                image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
                caption: 'New collection preview 👗✨ #fashion #style',
                likes: [users[4]._id, users[5]._id]
            },
            {
                user: users[2]._id,
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
                caption: 'Pizza night! 🍕 Who wants a slice?',
                likes: [users[0]._id, users[1]._id, users[6]._id, users[7]._id]
            },
            {
                user: users[0]._id,
                image: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800',
                caption: 'Golden hour magic ✨📸',
                likes: [users[2]._id, users[4]._id, users[5]._id]
            },
            {
                user: users[1]._id,
                image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
                caption: 'Exploring new cities 🗺️ #travel',
                likes: [users[3]._id, users[6]._id]
            },
            {
                user: users[4]._id,
                image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
                caption: 'Abstract vibes 🌈 #art #creative',
                likes: [users[1]._id, users[2]._id, users[7]._id]
            },
            {
                user: users[3]._id,
                image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
                caption: 'Yoga by the beach 🧘‍♀️🌊 #wellness',
                likes: [users[0]._id, users[5]._id, users[6]._id]
            }
        ]);

        console.log('Created posts');

        // Add random comments to posts
        const commentTexts = [
            'Amazing! 😍',
            'Love this! ❤️',
            'So beautiful! 🌟',
            'Incredible shot! 📸',
            'This is perfect! ✨',
            'Wow, stunning! 🔥',
            'Great work! 👏',
            'Absolutely gorgeous! 💯',
            'Can\'t stop looking at this! 👀',
            'This made my day! ☀️',
            'Goals! 🎯',
            'Obsessed with this! 😊',
            'Pure perfection! 💎',
            'You\'re so talented! 🌈',
            'This is everything! 🙌',
            'Breathtaking! 🌺',
            'I need this in my life! 💫',
            'Absolutely love it! 💕',
            'This is art! 🎨',
            'So inspiring! ⭐',
            'Beautiful capture! 📷',
            'This is incredible! 🤩',
            'Love the vibes! ✌️',
            'Perfect timing! ⏰',
            'This is gold! 🏆',
            'Amazing composition! 🖼️',
            'So creative! 💡',
            'This speaks to me! 🗣️',
            'Masterpiece! 👑',
            'Absolutely stunning! 🌸',
            'This is fire! 🔥🔥',
            'Love everything about this! 💖',
            'Can\'t get enough! 🤗',
            'This is magic! ✨✨',
            'So good! 👌',
            'Perfection! 💯💯',
            'This is goals! 🎯🎯',
            'Incredible work! 👏👏',
            'Love the colors! 🌈🌈',
            'This is beautiful! 😍😍'
        ];

        // Add 3-8 random comments to each post
        for (const post of posts) {
            const numComments = Math.floor(Math.random() * 6) + 3; // 3-8 comments
            const comments = [];

            for (let i = 0; i < numComments; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomText = commentTexts[Math.floor(Math.random() * commentTexts.length)];

                comments.push({
                    user: randomUser._id,
                    text: randomText,
                    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
                });
            }

            post.comments = comments;
            await post.save();
        }

        console.log('Added random comments to posts');
        console.log('\nSeed data created successfully!');
        console.log(`\nCreated ${users.length} users and ${posts.length} posts`);
        console.log('Added 3-8 random comments to each post');
        console.log('\nTest credentials:');
        console.log('Email: john@example.com');
        console.log('Password: password123');

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
