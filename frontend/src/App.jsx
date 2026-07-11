import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FindRide from './pages/FindRide';
import OfferRide from './pages/OfferRide';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Inbox from './pages/Inbox';
import Chat from './pages/Chat';
import TrackRide from './pages/TrackRide';
import MyRides from './pages/MyRides';
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-paper">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/find-ride" element={<FindRide />} />
          <Route
            path="/offer-ride"
            element={
              <ProtectedRoute allowedRoles={['host']}>
                <OfferRide />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-rides"
            element={
              <ProtectedRoute allowedRoles={['host']}>
                <MyRides />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['partner']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <ProtectedRoute>
                <Inbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:partnerId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track-ride"
            element={
              <ProtectedRoute>
                <TrackRide />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3500} theme="light" />
    </div>
  );
}

export default App;
