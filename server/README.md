# FlickNet Backend API

A comprehensive Node.js + Express.js backend for the FlickNet movie platform.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Movie Management**: CRUD operations, search, recommendations, ratings
- **Subscription System**: Free/Basic/Premium tiers with feature gating
- **Notification System**: In-app notifications with delivery tracking
- **User Management**: Profiles, preferences, watchlists
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, input validation, password hashing

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── movieController.js   # Movie operations
│   ├── subscriptionController.js # Subscription management
│   └── notificationController.js # Notification system
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── errorHandler.js     # Global error handling
├── models/
│   ├── User.js             # User schema
│   ├── Movie.js            # Movie schema
│   ├── Subscription.js     # Subscription schema
│   └── Notification.js     # Notification schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── movies.js           # Movie routes
│   ├── subscriptions.js    # Subscription routes
│   └── notifications.js    # Notification routes
├── scripts/
│   └── seedDatabase.js     # Database seeding script
└── server.js               # Main server file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - MongoDB connection string
   - JWT secret key
   - Stripe keys (for payments)

3. **Start MongoDB**
   
   Local MongoDB:
   ```bash
   mongod
   ```
   
   Or use MongoDB Atlas (cloud) by updating `MONGODB_URI` in `.env`

4. **Seed Database** (Optional)
   ```bash
   npm run seed
   ```
   
   This creates sample movies, users, and data for testing.

5. **Start Development Server**
   ```bash
   npm run server:dev
   ```
   
   Or for production:
   ```bash
   npm run server
   ```

## 🔗 API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /logout` - User logout

### Movies (`/api/movies`)
- `GET /` - Get all movies (with pagination, filtering)
- `GET /featured` - Get featured movies
- `GET /search` - Search movies
- `GET /genre/:genre` - Get movies by genre
- `GET /recommendations` - Get personalized recommendations (Premium)
- `GET /:id` - Get single movie
- `POST /:id/watchlist` - Add to watchlist
- `DELETE /:id/watchlist` - Remove from watchlist
- `POST /:id/rate` - Rate a movie

### Subscriptions (`/api/subscriptions`)
- `GET /plans` - Get available subscription plans
- `GET /me` - Get user's subscription
- `GET /usage` - Get subscription usage stats
- `PUT /plan` - Update subscription plan
- `DELETE /cancel` - Cancel subscription

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `GET /unread-count` - Get unread notification count
- `GET /preferences` - Get notification preferences
- `PUT /preferences` - Update notification preferences
- `PUT /read-all` - Mark all notifications as read
- `GET /:id` - Get single notification
- `PUT /:id/read` - Mark notification as read
- `DELETE /:id` - Delete notification

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Models

### User
- Personal information (name, email, username)
- Authentication (password, role)
- Subscription details
- Preferences (theme, notifications, privacy)
- Activity data (watchlist, ratings, reviews)

### Movie
- Basic info (title, year, genre, director, cast)
- Content (description, poster, backdrop, trailer)
- Metadata (rating, views, status, release date)
- Engagement metrics (likes, watchlist count)

### Subscription
- User reference and plan type
- Billing information (cycle, amount, payment method)
- Feature limits and permissions
- Status and renewal settings

### Notification
- User-specific notifications
- Type-based categorization
- Delivery tracking (in-app, email, push)
- Related entity references

## 🎯 Subscription Tiers

### Free
- Basic movie browsing
- Limited watchlist (10 items)
- Limited ratings (5 items)
- Basic search only

### Basic ($9.99/month)
- Enhanced watchlist (100 items)
- More ratings (50 items)
- Advanced search
- Recommendations
- Community features
- HD streaming

### Premium ($19.99/month)
- Unlimited watchlist and ratings
- Priority support
- Exclusive content
- Offline viewing
- Multiple profiles (5)
- All features unlocked

## 🧪 Testing

Sample accounts created by the seeder:

- **Admin**: `admin@flicknet.com` / `admin123`
- **Basic User**: `fan@example.com` / `password123`
- **Free User**: `cinephile@example.com` / `password123`

## 🔧 Development Scripts

- `npm run server` - Start production server
- `npm run server:dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm run dev` - Start both frontend and backend concurrently

## 🚀 Deployment

1. Set `NODE_ENV=production` in environment
2. Update MongoDB URI for production database
3. Set secure JWT secret
4. Configure Stripe production keys
5. Deploy to your preferred platform (Heroku, AWS, etc.)

## 📝 Environment Variables

Required environment variables:

```env
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/flicknet
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
