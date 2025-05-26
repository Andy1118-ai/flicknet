// Database seeding script for FlickNet sample movies
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
require('dotenv').config();

// Sample movie data for all genres
const sampleMovies = [
  // ACTION MOVIES
  {
    title: "Thunder Strike",
    description: "An elite special forces operative must stop a terrorist organization from detonating nuclear weapons across major cities. High-octane action sequences and explosive stunts make this a thrilling ride from start to finish.",
    year: 2023,
    runtime: 128,
    averageRating: 8.2,
    genre: ["Action", "Thriller"],
    poster: "https://picsum.photos/400/600?random=1",
    backdrop: "https://picsum.photos/1920/1080?random=1",
    isPremium: false,
    director: "Michael Bay",
    cast: ["Chris Evans", "Scarlett Johansson", "Mark Wahlberg"],
    views: 2500000,
    isActive: true,
    releaseDate: new Date("2023-06-15"),
    status: "released"
  },
  {
    title: "Velocity",
    description: "A former race car driver turned getaway driver must complete one last job to save his kidnapped daughter. Fast cars, intense chases, and heart-pounding action await.",
    year: 2022,
    runtime: 115,
    averageRating: 7.8,
    genre: ["Action", "Crime"],
    poster: "https://picsum.photos/400/600?random=2",
    backdrop: "https://picsum.photos/1920/1080?random=2",
    isPremium: true,
    director: "Denis Villeneuve",
    cast: ["Ryan Gosling", "Charlize Theron", "Idris Elba"],
    views: 1800000,
    isActive: true,
    releaseDate: new Date("2022-08-20"),
    status: "released"
  },
  {
    title: "Iron Fist Legacy",
    description: "A martial arts master seeks revenge against the crime syndicate that destroyed his family. Featuring spectacular fight choreography and ancient fighting techniques.",
    year: 2023,
    runtime: 105,
    averageRating: 8.5,
    genre: ["Action", "Adventure"],
    poster: "https://picsum.photos/400/600?random=3",
    backdrop: "https://picsum.photos/1920/1080?random=3",
    isPremium: false,
    director: "John Woo",
    cast: ["Jackie Chan", "Michelle Yeoh", "Donnie Yen"],
    views: 3200000,
    isActive: true,
    releaseDate: new Date("2023-03-10"),
    status: "released"
  },

  // COMEDY MOVIES
  {
    title: "The Misadventures of Bob",
    description: "A bumbling office worker accidentally becomes a spy and must save the world while trying not to blow his cover or his chances with his crush.",
    year: 2023,
    runtime: 108,
    averageRating: 7.2,
    genre: ["Comedy", "Action"],
    poster: "https://picsum.photos/400/600?random=11",
    backdrop: "https://picsum.photos/1920/1080?random=11",
    isPremium: false,
    director: "Edgar Wright",
    cast: ["Steve Carell", "Kristen Wiig", "Will Ferrell"],
    views: 1900000,
    isActive: true,
    releaseDate: new Date("2023-04-01"),
    status: "released"
  },
  {
    title: "Space Janitor",
    description: "A hapless janitor on a space station accidentally saves the galaxy while just trying to do his job and impress his alien coworkers.",
    year: 2023,
    runtime: 92,
    averageRating: 7.9,
    genre: ["Comedy", "Sci-Fi"],
    poster: "https://picsum.photos/400/600?random=13",
    backdrop: "https://picsum.photos/1920/1080?random=13",
    isPremium: false,
    director: "Taika Waititi",
    cast: ["Chris Pratt", "Aubrey Plaza", "Nick Offerman"],
    views: 2700000,
    isActive: true,
    releaseDate: new Date("2023-09-08"),
    status: "released"
  },

  // DRAMA MOVIES
  {
    title: "The Last Letter",
    description: "A war veteran returns home to find a letter from his deceased father that leads him on a journey of self-discovery and healing.",
    year: 2023,
    runtime: 127,
    averageRating: 8.8,
    genre: ["Drama", "War"],
    poster: "https://picsum.photos/400/600?random=16",
    backdrop: "https://picsum.photos/1920/1080?random=16",
    isPremium: true,
    director: "Alejandro G. Iñárritu",
    cast: ["Adam Driver", "Lupita Nyong'o", "Brian Cox"],
    views: 1800000,
    isActive: true,
    releaseDate: new Date("2023-01-20"),
    status: "released"
  },
  {
    title: "Broken Dreams",
    description: "A former pianist struggles to rebuild her life after a career-ending injury, finding hope through teaching music to underprivileged children.",
    year: 2022,
    runtime: 118,
    averageRating: 8.3,
    genre: ["Drama", "Music"],
    poster: "https://picsum.photos/400/600?random=17",
    backdrop: "https://picsum.photos/1920/1080?random=17",
    isPremium: false,
    director: "Damien Chazelle",
    cast: ["Saoirse Ronan", "Mahershala Ali", "Viola Davis"],
    views: 2100000,
    isActive: true,
    releaseDate: new Date("2022-09-23"),
    status: "released"
  },

  // HORROR MOVIES
  {
    title: "The Haunting of Blackwood Manor",
    description: "A family moves into an old Victorian mansion, only to discover they're not alone. Dark secrets from the past threaten to consume them all.",
    year: 2023,
    runtime: 105,
    averageRating: 7.4,
    genre: ["Horror", "Thriller"],
    poster: "https://picsum.photos/400/600?random=18",
    backdrop: "https://picsum.photos/1920/1080?random=18",
    isPremium: true,
    director: "James Wan",
    cast: ["Vera Farmiga", "Patrick Wilson", "Madison Wolfe"],
    views: 2800000,
    isActive: true,
    releaseDate: new Date("2023-10-31"),
    status: "released"
  },

  // SCI-FI MOVIES
  {
    title: "Quantum Paradox",
    description: "A physicist discovers a way to travel between parallel universes, but each jump creates dangerous ripples across reality itself.",
    year: 2024,
    runtime: 148,
    averageRating: 8.9,
    genre: ["Sci-Fi", "Thriller"],
    poster: "https://picsum.photos/400/600?random=20",
    backdrop: "https://picsum.photos/1920/1080?random=20",
    isPremium: true,
    director: "Denis Villeneuve",
    cast: ["Oscar Isaac", "Tilda Swinton", "Michael Fassbender"],
    views: 3400000,
    isActive: true,
    releaseDate: new Date("2024-03-15"),
    status: "released"
  },
  {
    title: "Mars Colony Alpha",
    description: "The first human colony on Mars faces extinction when their life support systems fail. A small team must venture into the hostile Martian landscape to find salvation.",
    year: 2023,
    runtime: 134,
    averageRating: 8.1,
    genre: ["Sci-Fi", "Adventure"],
    poster: "https://picsum.photos/400/600?random=21",
    backdrop: "https://picsum.photos/1920/1080?random=21",
    isPremium: false,
    director: "Ridley Scott",
    cast: ["Matt Damon", "Jessica Chastain", "Chiwetel Ejiofor"],
    views: 2900000,
    isActive: true,
    releaseDate: new Date("2023-08-11"),
    status: "released"
  },

  // FANTASY MOVIES
  {
    title: "The Dragon's Crown",
    description: "A young blacksmith discovers she's the last of an ancient bloodline capable of forging weapons that can defeat dragons threatening the realm.",
    year: 2023,
    runtime: 142,
    averageRating: 8.5,
    genre: ["Fantasy", "Adventure"],
    poster: "https://picsum.photos/400/600?random=22",
    backdrop: "https://picsum.photos/1920/1080?random=22",
    isPremium: true,
    director: "Guillermo del Toro",
    cast: ["Anya Taylor-Joy", "Dev Patel", "Cate Blanchett"],
    views: 3600000,
    isActive: true,
    releaseDate: new Date("2023-12-01"),
    status: "released"
  },

  // ANIMATION MOVIES
  {
    title: "Pixel Kingdom",
    description: "A young gamer gets transported into a retro video game world where he must complete increasingly difficult levels to return home.",
    year: 2023,
    runtime: 95,
    averageRating: 8.7,
    genre: ["Animation", "Family", "Adventure"],
    poster: "https://picsum.photos/400/600?random=8",
    backdrop: "https://picsum.photos/1920/1080?random=8",
    isPremium: false,
    director: "Brad Bird",
    cast: ["Tom Holland", "Anya Taylor-Joy", "Jack Black"],
    views: 4200000,
    isActive: true,
    releaseDate: new Date("2023-11-22"),
    status: "released"
  },

  // THRILLER MOVIES
  {
    title: "The Silent Witness",
    description: "A deaf woman becomes the only witness to a murder, but the killer knows she saw everything and will stop at nothing to silence her forever.",
    year: 2023,
    runtime: 118,
    averageRating: 8.2,
    genre: ["Thriller", "Crime"],
    poster: "https://picsum.photos/400/600?random=26",
    backdrop: "https://picsum.photos/1920/1080?random=26",
    isPremium: true,
    director: "David Fincher",
    cast: ["Emily Blunt", "John Krasinski", "Brian Cox"],
    views: 2700000,
    isActive: true,
    releaseDate: new Date("2023-09-15"),
    status: "released"
  },

  // ROMANCE MOVIES
  {
    title: "Love in the Time of AI",
    description: "A tech executive falls in love with an AI researcher, but their relationship is tested when they discover their work could change humanity forever.",
    year: 2023,
    runtime: 112,
    averageRating: 7.6,
    genre: ["Romance", "Sci-Fi"],
    poster: "https://picsum.photos/400/600?random=24",
    backdrop: "https://picsum.photos/1920/1080?random=24",
    isPremium: false,
    director: "Spike Jonze",
    cast: ["Ryan Gosling", "Emma Stone", "Scarlett Johansson"],
    views: 2300000,
    isActive: true,
    releaseDate: new Date("2023-02-14"),
    status: "released"
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Seed the database
const seedMovies = async () => {
  try {
    console.log('🌱 Starting movie database seeding...');
    
    // Clear existing movies
    await Movie.deleteMany({});
    console.log('🗑️  Cleared existing movies');

    // Insert sample movies
    const insertedMovies = await Movie.insertMany(sampleMovies);
    console.log(`✅ Successfully seeded ${insertedMovies.length} movies`);

    // Display genre statistics
    const genreStats = {};
    insertedMovies.forEach(movie => {
      movie.genre.forEach(genre => {
        genreStats[genre] = (genreStats[genre] || 0) + 1;
      });
    });

    console.log('\n📊 Genre Statistics:');
    Object.entries(genreStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([genre, count]) => {
        console.log(`   ${genre}: ${count} movies`);
      });

    console.log('\n🎬 Sample movies seeded successfully!');
    console.log('   - Mix of premium and free movies');
    console.log('   - Varied ratings for testing filters');
    console.log('   - Multiple genres for category testing');
    console.log('   - Recent release dates for trending');
    
  } catch (error) {
    console.error('❌ Error seeding movies:', error);
  }
};

// Run the seeding script
const runSeed = async () => {
  await connectDB();
  await seedMovies();
  process.exit(0);
};

// Check if script is run directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedMovies, sampleMovies };
