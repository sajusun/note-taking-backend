import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Note from './models/Note.js';
import Post from './models/Post.js';

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Note.deleteMany({});
    await Post.deleteMany({});
    console.log('[Seed] Cleared existing data');

    // Create Admin User
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@careguide.com',
      password: 'password123',
      role: 'admin',
      interests: ['management', 'technology', 'chess']
    });

    // Create Regular Users
    const user1 = await User.create({
      name: 'Rahim Ahmed',
      email: 'rahim@careguide.com',
      password: 'password123',
      role: 'user',
      interests: ['chess', 'reading', 'javascript']
    });

    const user2 = await User.create({
      name: 'Fatima Khan',
      email: 'fatima@careguide.com',
      password: 'password123',
      role: 'user',
      interests: ['reading', 'design', 'travel']
    });

    const user3 = await User.create({
      name: 'Tanvir Hossain',
      email: 'tanvir@careguide.com',
      password: 'password123',
      role: 'user',
      interests: ['technology', 'gaming', 'chess']
    });

    console.log('[Seed] Created 4 users (1 Admin, 3 Regular Users)');

    // Create Notes
    await Note.create([
      {
        title: 'Project Architecture Notes',
        content: 'Review MongoDB ESR rule and ensure indexes support pagination.',
        userId: admin._id
      },
      {
        title: 'Rahim Daily Tasks',
        content: 'Review code commits and test JWT authentication flow.',
        userId: user1._id
      },
      {
        title: 'Rahim Learning Roadmap',
        content: 'Master MongoDB aggregation pipeline stages: $unwind, $group, $lookup.',
        userId: user1._id
      },
      {
        title: 'Fatima UI Wireframes',
        content: 'Draft minimal responsive UI layout for the note dashboard.',
        userId: user2._id
      },
      {
        title: 'Tanvir Game Mechanics Notes',
        content: 'Notes on turn-based game algorithms and state trees.',
        userId: user3._id
      }
    ]);
    console.log('[Seed] Created 5 sample notes');

    // Create Posts (For Scenario 2: $lookup)
    await Post.create([
      {
        title: 'Announcing Care Guide 2.0 Platform',
        content: 'Welcome everyone! We are launching our updated developer platform.',
        userId: admin._id
      },
      {
        title: 'Why I Love Chess and Problem Solving',
        content: 'Chess helps develop tactical thinking and pattern recognition in software engineering.',
        userId: user1._id
      },
      {
        title: 'My Favorite JavaScript Features in 2026',
        content: 'Top-level await, structured clone, and array group methods are game changers.',
        userId: user1._id
      },
      {
        title: 'Design Principles for Minimalist Apps',
        content: 'Functionality should always take precedence over excessive aesthetic flair.',
        userId: user2._id
      }
    ]);
    console.log('[Seed] Created 4 sample posts');

    console.log('[Seed] Database seeding completed successfully!');
    console.log('--- Test Accounts ---');
    console.log('Admin: admin@careguide.com | Password: password123');
    console.log('User 1: rahim@careguide.com | Password: password123');
    console.log('User 2: fatima@careguide.com | Password: password123');
    console.log('---------------------');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
