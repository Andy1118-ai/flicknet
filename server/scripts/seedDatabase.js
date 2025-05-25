const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Movie = require('../models/Movie');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');

// Sample movie data
const sampleMovies = [
  {
    title: "Dune: Part Two",
    year: 2024,
    genre: ["Sci-Fi", "Adventure", "Drama"],
    rating: 8.8,
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    poster: "/api/placeholder/300/450",
    backdrop: "/api/placeholder/1200/675",
    trailer: "https://example.com/trailer",
    status: "released",
    releaseDate: new Date("2024-03-01"),
    runtime: 166,
    language: "English",
    country: "United States"
  },
  {
    title: "Oppenheimer",
    year: 2023,
    genre: ["Biography", "Drama", "History"],
    rating: 8.5,
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."],
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    poster: "/api/placeholder/300/450",
    backdrop: "/api/placeholder/1200/675",
    status: "released",
    releaseDate: new Date("2023-07-21"),
    runtime: 180,
    language: "English",
    country: "United States"
  },
  {
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    genre: ["Animation", "Action", "Adventure"],
    rating: 8.7,
    director: "Joaquim Dos Santos",
    cast: ["Shameik Moore", "Hailee Steinfeld", "Brian Tyree Henry"],
    description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    poster: "/api/placeholder/300/450",
    backdrop: "/api/placeholder/1200/675",
    status: "released",
    releaseDate: new Date("2023-06-02"),
    runtime: 140,
    language: "English",
    country: "United States"
  },
  {
    title: "The Batman",
    year: 2022,
    genre: ["Action", "Crime", "Drama"],
    rating: 7.8,
    director: "Matt Reeves",
    cast: ["Robert Pattinson", "Zoë Kravitz", "Jeffrey Wright"],
    description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
    poster: "/api/placeholder/300/450",
    backdrop: "/api/placeholder/1200/675",
    status: "released",
    releaseDate: new Date("2022-03-04"),
    runtime: 176,
    language: "English",
    country: "United States"
  },
  {
    title: "Top Gun: Maverick",
    year: 2022,
    genre: ["Action", "Drama"],
    rating: 8.3,
    director: "Joseph Kosinski",
    cast: ["Tom Cruise", "Miles Teller", "Jennifer Connelly"],
    description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past.",
    poster: "/api/placeholder/300/450",
    backdrop: "/api/placeholder/1200/675",
    status: "released",
    releaseDate: new Date("2022-05-27"),
    runtime: 130,
    language: "English",
    country: "United States"
  },
  {
    title: "Avatar: The Way of Water",
    year: 2022,
    genre: ["Action", "Adventure", "Fantasy"],
    rating: 7.6,
    director: "James Cameron",
    cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
    description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.",
    poster: "/api/placeholder/300/450",
    backdrop: "/api/placeholder/1200/675",
    status: "released",
    releaseDate: new Date("2022-12-16"),
    runtime: 192,
    language: "English",
    country: "United States"
  },
  {
    title: "Everything Everywhere All at Once",
    year: 2022,
    genre: ["Action", "Adventure", "Comedy"],
    rating: 7.8,
    director: "Daniels",
    cast: ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan"],
    description: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence.",
    poster: "/api/placeholder/300/450",
    backdrop: "/api/placeholder/1200/675",
    status: "released",
    releaseDate: new Date("2022-03-25"),
    runtime: 139,
    language: "English",
    country: "United States"
  },
  {
    title: "Black Panther: Wakanda Forever",
    year: 2022,
    genre: ["Action", "Adventure", "Drama"],
    rating: 6.7,
    director: "Ryan Coogler",
    cast: ["Letitia Wright", "Lupita Nyong'o", "Danai Gurira"],
    description: "The people of Wakanda fight to protect their home from intervening world powers as they mourn the death of King T'Challa.",
    poster: "/api/placeholder/300/450",
    backdrop: "/api/placeholder/1200/675",
    status: "released",
    releaseDate: new Date("2022-11-11"),
    runtime: 161,
    language: "English",
    country: "United States"
  }
];

// Sample users
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@flicknet.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    subscription: 'premium'
  },
  {
    username: 'moviefan',
    email: 'fan@example.com',
    password: 'password123',
    firstName: 'Movie',
    lastName: 'Fan',
    role: 'user',
    subscription: 'basic'
  },
  {
    username: 'cinephile',
    email: 'cinephile@example.com',
    password: 'password123',
    firstName: 'Cinema',
    lastName: 'Lover',
    role: 'user',
    subscription: 'free'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flicknet');
    console.log('📊 Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Subscription.deleteMany({});
    await Notification.deleteMany({});

    // Create movies
    console.log('🎬 Creating movies...');
    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log(`✅ Created ${createdMovies.length} movies`);

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      
      // Create subscription for each user
      await Subscription.create({
        user: user._id,
        plan: user.subscription,
        status: 'active',
        ...(user.subscription !== 'free' && {
          billingCycle: 'monthly',
          amount: user.subscription === 'basic' ? 9.99 : 19.99,
          paymentMethod: 'card',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        })
      });

      // Create welcome notification
      await Notification.create({
        user: user._id,
        type: 'account_update',
        title: 'Welcome to FlickNet!',
        message: 'Your account has been created successfully. Start exploring movies and building your watchlist!',
        actionUrl: '/dashboard',
        actionText: 'Explore Movies',
        channels: {
          inApp: true,
          email: false,
          push: false
        }
      });
    }

    console.log(`✅ Created ${createdUsers.length} users with subscriptions and notifications`);

    // Add some sample ratings and watchlist items
    console.log('⭐ Adding sample ratings and watchlist items...');
    const movieFan = createdUsers.find(u => u.username === 'moviefan');
    if (movieFan && createdMovies.length > 0) {
      // Add some movies to watchlist
      movieFan.watchlist = [
        { movieId: createdMovies[0]._id },
        { movieId: createdMovies[1]._id },
        { movieId: createdMovies[2]._id }
      ];

      // Add some ratings
      movieFan.ratings = [
        { movieId: createdMovies[0]._id, rating: 9 },
        { movieId: createdMovies[1]._id, rating: 8 },
        { movieId: createdMovies[3]._id, rating: 7 }
      ];

      await movieFan.save();

      // Update movie stats
      createdMovies[0].watchlistCount = 1;
      createdMovies[0].ratingCount = 1;
      createdMovies[0].averageRating = 9;
      await createdMovies[0].save();

      createdMovies[1].watchlistCount = 1;
      createdMovies[1].ratingCount = 1;
      createdMovies[1].averageRating = 8;
      await createdMovies[1].save();
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Sample Accounts:');
    console.log('Admin: admin@flicknet.com / admin123');
    console.log('User: fan@example.com / password123');
    console.log('User: cinephile@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
