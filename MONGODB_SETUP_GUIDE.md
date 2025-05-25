# 🗄️ MongoDB Setup Guide for FlickNet

## 🎯 **Current Status**
Your FlickNet backend is ready and waiting for MongoDB connection. Let's get MongoDB running!

## 🔍 **Quick MongoDB Installation Check**

### **Step 1: Check if MongoDB is Already Installed**
Open Command Prompt as Administrator and try:

```cmd
# Check for MongoDB service
sc query MongoDB

# Check for mongod executable
where mongod

# Check common installation paths
dir "C:\Program Files\MongoDB\Server"
dir "C:\MongoDB"
```

### **Step 2: If MongoDB is Not Installed**

#### **Option A: Download MongoDB Community Server (Recommended)**

1. **Download MongoDB**:
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows x64
   - Download the `.msi` installer

2. **Install MongoDB**:
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - ✅ **IMPORTANT**: Check "Install MongoDB as a Service"
   - ✅ **IMPORTANT**: Check "Run service as Network Service user"
   - Install MongoDB Compass (optional GUI tool)

3. **Verify Installation**:
   ```cmd
   # Check if service is running
   sc query MongoDB
   
   # Start service if not running
   net start MongoDB
   ```

#### **Option B: Quick Docker Setup (If you have Docker)**

```bash
# Pull and run MongoDB in Docker
docker run -d -p 27017:27017 --name flicknet-mongo mongo:latest

# Verify it's running
docker ps
```

#### **Option C: MongoDB Atlas (Cloud - Easiest)**

1. Go to: https://www.mongodb.com/atlas
2. Create free account
3. Create new cluster (free tier)
4. Create database user
5. Whitelist your IP (or use 0.0.0.0/0 for development)
6. Get connection string
7. Update `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flicknet
   ```

## 🧪 **Testing MongoDB Connection**

### **Step 1: Verify MongoDB is Running**

```cmd
# Check if MongoDB is listening on port 27017
netstat -an | findstr :27017

# Should show something like:
# TCP    0.0.0.0:27017          0.0.0.0:0              LISTENING
```

### **Step 2: Test Connection with Node.js**

```bash
# In your FlickNet directory
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test')
  .then(() => { console.log('✅ MongoDB Connected!'); process.exit(0); })
  .catch(err => { console.log('❌ Connection failed:', err.message); process.exit(1); });
"
```

## 🚀 **FlickNet Backend Testing Steps**

### **Step 1: Start the Backend Server**

```bash
# Start the backend (it will show MongoDB connection status)
npm run server:dev
```

**Expected Output:**
```
🚀 FlickNet API Server running on port 3002
📱 Frontend URL: http://localhost:3000
🌍 Environment: development
📊 MongoDB Connected: localhost:27017
```

### **Step 2: Seed the Database**

```bash
# In a new terminal, populate sample data
npm run seed
```

**Expected Output:**
```
📊 Connected to MongoDB
🧹 Clearing existing data...
🎬 Creating movies...
✅ Created 8 movies
👥 Creating users...
✅ Created 3 users with subscriptions and notifications
⭐ Adding sample ratings and watchlist items...
🎉 Database seeded successfully!

📋 Sample Accounts:
Admin: admin@flicknet.com / admin123
User: fan@example.com / password123
User: cinephile@example.com / password123
```

### **Step 3: Test API Endpoints**

```bash
# Test the API
npm run test:api
```

**Expected Output:**
```
🧪 Testing FlickNet API Endpoints...

1. Testing Health Check...
✅ Health Check: FlickNet API Server is running

2. Testing Subscription Plans...
✅ Subscription Plans: free,basic,premium

3. Testing Movies Endpoint...
✅ Movies: Found 8 movies

4. Testing User Registration...
✅ User Registration: testuser_1234567890

5. Testing User Login...
✅ User Login: testuser_1234567890

6. Testing Protected Route...
✅ User Profile: Test User

7. Testing User Subscription...
✅ User Subscription: free

8. Testing Notifications...
✅ Notifications: 1 notifications, 1 unread

🎉 All API tests passed successfully!
```

### **Step 4: Start the Full Application**

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Backend API on http://localhost:3002
- React frontend on http://localhost:3000

## 🔧 **Troubleshooting Common Issues**

### **MongoDB Won't Start**

```cmd
# Check Windows services
services.msc
# Look for "MongoDB" service and start it

# Or start manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

### **Port 27017 Already in Use**

```cmd
# Find what's using the port
netstat -ano | findstr :27017

# Kill the process (replace PID with actual process ID)
taskkill /PID 1234 /F
```

### **Permission Issues**

- Run Command Prompt as Administrator
- Ensure MongoDB data directory exists: `C:\data\db`
- Create it if missing: `mkdir C:\data\db`

### **Connection String Issues**

For local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/flicknet
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flicknet
```

## 🎯 **Quick Start Commands**

Once MongoDB is running:

```bash
# 1. Seed the database
npm run seed

# 2. Start the backend
npm run server:dev

# 3. In another terminal, start frontend
npm start

# Or start both together
npm run dev
```

## ✅ **Success Indicators**

You'll know everything is working when:

1. **Backend starts without MongoDB errors**
2. **Database seeding completes successfully**
3. **API tests pass**
4. **Frontend connects to backend**
5. **You can register/login users**
6. **Movies display in the dashboard**
7. **Subscription features work**

## 🆘 **Need Help?**

If you encounter issues:

1. **Check MongoDB Status**: `sc query MongoDB`
2. **Check Port**: `netstat -an | findstr :27017`
3. **Check Logs**: Look at the backend server output
4. **Try MongoDB Atlas**: Easiest cloud option
5. **Use Docker**: If you have Docker installed

The FlickNet backend is robust and will guide you through any connection issues with helpful error messages!
