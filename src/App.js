
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Settings from './components/settings/Settings';
import Subscription from './components/subscription/Subscription';
import Community from './components/community/Community';
import AdminPanel from './components/admin/AdminPanel';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TailwindTest from './components/TailwindTest';
import GenrePage from './components/movies/GenrePage';
import MovieDetailPage from './components/movies/MovieDetailPage';
import MoviePlayer from './components/movies/MoviePlayer';


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Public Dashboard Route */}
              <Route path="/" element={
                <Layout>
                  <Dashboard />
                </Layout>
              } />
              <Route path="/dashboard" element={
                <Layout>
                  <Dashboard />
                </Layout>
              } />

              {/* Movie Routes */}
              <Route path="/genre/:genre" element={
                <Layout>
                  <GenrePage />
                </Layout>
              } />
              <Route path="/movie/:id" element={
                <Layout>
                  <MovieDetailPage />
                </Layout>
              } />
              <Route path="/watch/:id" element={<MoviePlayer />} />

              {/* Protected Routes */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/subscription" element={
                <ProtectedRoute>
                  <Layout>
                    <Subscription />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/community" element={
                <ProtectedRoute>
                  <Layout>
                    <Community />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <Layout>
                    <AdminPanel />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
