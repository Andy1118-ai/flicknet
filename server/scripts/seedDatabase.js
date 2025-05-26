const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { connectDB } = require('../config/database');
const { User, Movie, Subscription, Notification } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting MongoDB database seeding...');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Subscription.deleteMany({});
    await Notification.deleteMany({});

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@flicknet.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    // Create moderator user
    console.log('👮 Creating moderator user...');
    const moderatorUser = await User.create({
      username: 'moderator',
      email: 'moderator@flicknet.com',
      password: 'mod123',
      firstName: 'Content',
      lastName: 'Moderator',
      role: 'moderator'
    });

    // Create regular users
    console.log('👥 Creating regular users...');
    const regularUser1 = await User.create({
      username: 'moviefan',
      email: 'fan@example.com',
      password: 'password123',
      firstName: 'Movie',
      lastName: 'Fan',
      role: 'user'
    });

    const regularUser2 = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'test123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    });

    // Create subscriptions
    console.log('💳 Creating subscriptions...');
    await Subscription.create({
      userId: adminUser._id,
      type: 'premium',
      plan: {
        name: 'Premium',
        price: 9.99,
        currency: 'USD',
        interval: 'month'
      },
      status: 'active',
      features: {
        maxStreams: 4,
        hdStreaming: true,
        downloadOffline: true,
        adFree: true,
        exclusiveContent: true
      }
    });

    await Subscription.create({
      userId: moderatorUser._id,
      type: 'premium',
      plan: {
        name: 'Premium',
        price: 9.99,
        currency: 'USD',
        interval: 'month'
      },
      status: 'active',
      features: {
        maxStreams: 4,
        hdStreaming: true,
        downloadOffline: true,
        adFree: true,
        exclusiveContent: true
      }
    });

    await Subscription.create({
      userId: regularUser1._id,
      type: 'freemium',
      plan: {
        name: 'Freemium',
        price: 0,
        currency: 'USD',
        interval: 'month'
      },
      status: 'active',
      features: {
        maxStreams: 1,
        hdStreaming: false,
        downloadOffline: false,
        adFree: false,
        exclusiveContent: false
      }
    });

    await Subscription.create({
      userId: regularUser2._id,
      type: 'freemium',
      plan: {
        name: 'Freemium',
        price: 0,
        currency: 'USD',
        interval: 'month'
      },
      status: 'active',
      features: {
        maxStreams: 1,
        hdStreaming: false,
        downloadOffline: false,
        adFree: false,
        exclusiveContent: false
      }
    });

    // Create sample movies
    console.log('🎬 Creating sample movies...');
    const sampleMovies = [
      {
        title: 'The Matrix',
        description: 'A computer programmer discovers that reality as he knows it is a simulation.',
        releaseDate: new Date('1999-03-31'),
        duration: 136,
        genres: ['Action', 'Sci-Fi'],
        rating: {
          imdb: 8.7,
          tmdb: 8.2,
          flicknet: 8.5
        },
        images: {
          poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg'
        },
        externalIds: {
          tmdb: 603
        },
        featured: true,
        trending: true
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through dream-sharing technology.',
        releaseDate: new Date('2010-07-16'),
        duration: 148,
        genres: ['Action', 'Sci-Fi', 'Thriller'],
        rating: {
          imdb: 8.8,
          tmdb: 8.3,
          flicknet: 8.6
        },
        images: {
          poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg'
        },
        externalIds: {
          tmdb: 27205
        },
        featured: true,
        subscriptionRequired: true
      },
      {
        title: 'The Dark Knight',
        description: 'Batman faces the Joker in this epic superhero thriller.',
        releaseDate: new Date('2008-07-18'),
        duration: 152,
        genres: ['Action', 'Crime', 'Drama'],
        rating: {
          imdb: 9.0,
          tmdb: 8.5,
          flicknet: 8.8
        },
        images: {
          poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/hqkIcbrOHL86UncnHIsHVcVmzue.jpg'
        },
        externalIds: {
          tmdb: 155
        },
        featured: true,
        trending: true,
        subscriptionRequired: true
      }
    ];

    await Movie.insertMany(sampleMovies);

    // Create welcome notifications
    console.log('🔔 Creating welcome notifications...');
    const users = [adminUser, moderatorUser, regularUser1, regularUser2];
    
    for (const user of users) {
      await Notification.create({
        userId: user._id,
        type: 'system',
        title: 'Welcome to FlickNet!',
        message: `Hello ${user.firstName}! Welcome to FlickNet. Start exploring our movie collection.`,
        data: {
          actionUrl: '/dashboard'
        },
        priority: 'medium'
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`👤 Created ${users.length} users`);
    console.log(`🎬 Created ${sampleMovies.length} movies`);
    console.log(`💳 Created ${users.length} subscriptions`);
    console.log(`🔔 Created ${users.length} notifications`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();
