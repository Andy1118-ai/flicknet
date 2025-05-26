# FlickNet 🎬

A modern streaming platform built with React, Node.js, and Firebase. FlickNet offers a Netflix-style experience with freemium features, subscription management, and a comprehensive movie catalog.

## ✨ Features

- **🎯 Freemium Model**: Public dashboard with premium features for subscribers
- **🔐 Authentication**: Secure user registration and login with Firebase Auth
- **💳 Subscription Management**: Multiple tiers (Free, Basic, Premium) with Stripe integration
- **🎬 Movie Catalog**: Extensive movie database with genres, ratings, and details
- **🎨 Modern UI**: Tailwind CSS with blue color scheme and smooth animations
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔔 Notifications**: Real-time user notifications and updates
- **⚡ Fast Performance**: Optimized React components and efficient data loading
- **🔥 Firebase Integration**: Cloud Firestore for scalable data storage

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Firebase account
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
   Edit `.env` with your Firebase and Stripe credentials.

4. **Set up Firebase**
   Follow the [Firebase Setup Guide](./FIREBASE_SETUP_GUIDE.md) for detailed instructions.

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start them separately:
   npm run server:dev  # Backend
   npm start          # Frontend
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Context API
- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth + JWT tokens
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
│   ├── models/
│   │   └── firebase/      # Firebase data models
│   ├── routes/            # API routes
│   ├── config/            # Firebase configuration
│   └── middleware/        # Custom middleware
└── public/                # Static assets
```

## 🎬 Available Scripts

### Development
- `npm run dev` - Starts both frontend and backend
- `npm start` - Runs the frontend in development mode
- `npm run server:dev` - Starts the backend with nodemon
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production

### Database
- `npm run seed` - Seeds Firebase with sample data
- `npm run setup:firebase` - Firebase setup assistant

## 🌟 Key Features

### Authentication & Authorization
- Firebase Authentication integration
- JWT-based API authentication
- Role-based access control
- Secure password hashing

### Subscription System
- Three-tier subscription model (Free, Basic, Premium)
- Stripe payment integration
- Automatic subscription management
- Firebase-based subscription tracking

### Movie System
- Genre-based navigation
- Movie details and ratings
- Recommendation engine
- Search functionality
- Firebase Firestore data storage

### User Experience
- Smooth animations and transitions
- Loading states and error handling
- Responsive design for all devices
- Dark/light theme support
- Real-time data updates

## 📚 Documentation

For detailed setup and development guides, check out:
- [Firebase Setup Guide](./FIREBASE_SETUP_GUIDE.md)
- [Backend Setup Guide](./BACKEND_SETUP.md)
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
