# FlickNet 🎬

A modern streaming platform built with React, Node.js, and MongoDB. FlickNet offers a Netflix-style experience with freemium features, subscription management, and a comprehensive movie catalog.

## ✨ Features

- **🎯 Freemium Model**: Public dashboard with premium features for subscribers
- **🔐 Authentication**: Secure user registration and login system
- **💳 Subscription Management**: Multiple tiers (Free, Basic, Premium) with Stripe integration
- **🎬 Movie Catalog**: Extensive movie database with genres, ratings, and details
- **🎨 Modern UI**: Tailwind CSS with blue color scheme and smooth animations
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔔 Notifications**: Real-time user notifications and updates
- **⚡ Fast Performance**: Optimized React components and efficient data loading

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Andy1118-ai/flicknet.git
   cd flicknet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB Atlas and Stripe credentials.

4. **Start the development server**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

5. **Start the backend server** (in a new terminal)
   ```bash
   cd server
   node server.js
   ```

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Context API
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens
- **Payments**: Stripe
- **Styling**: Tailwind CSS with custom animations

## 📁 Project Structure

```
flicknet/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── movies/         # Movie-related components
│   │   ├── payment/        # Payment components
│   │   └── ui/             # Reusable UI components
│   ├── context/            # React Context providers
│   ├── services/           # API services
│   └── styles/             # Global styles
├── server/
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── middleware/        # Custom middleware
└── public/                # Static assets
```

## 🎬 Available Scripts

### Frontend
- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production

### Backend
- `node server/server.js` - Starts the backend server
- `node server/scripts/seedDatabase.js` - Seeds the database with sample data

## 🌟 Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Secure password hashing

### Subscription System
- Three-tier subscription model (Free, Basic, Premium)
- Stripe payment integration
- Automatic subscription management

### Movie System
- Genre-based navigation
- Movie details and ratings
- Recommendation engine
- Search functionality

### User Experience
- Smooth animations and transitions
- Loading states and error handling
- Responsive design for all devices
- Dark/light theme support

## 📚 Documentation

For detailed setup and development guides, check out:
- [Backend Setup Guide](./BACKEND_SETUP.md)
- [MongoDB Setup Guide](./MONGODB_SETUP_GUIDE.md)
- [Frontend-Backend Integration](./FRONTEND_BACKEND_INTEGRATION.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Create React App
- Styled with Tailwind CSS
- Icons from Heroicons
- Movie data from sample datasets
