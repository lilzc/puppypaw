import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OwnerPage from './pages/OwnerPage';
import WalkerPage from './pages/WalkerPage';
import TrackingPage from './pages/TrackingPage';
import ReviewPage from './pages/ReviewPage';
import ProfilePage from './pages/ProfilePage';
import OwnerRegisterPage from './pages/OwnerRegisterPage';
import WalkerRegisterPage from './pages/WalkerRegisterPage';
import BookingPage from './pages/BookingPage';
import PetInfoPage from './pages/PetInfoPage';
import WalkerListPage from './pages/WalkerListPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children, role }: { children: ReactNode; role?: 'owner' | 'walker' }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'owner' ? '/owner' : '/walker'} replace />;
  }
  return <>{children}</>;
}

function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#F9F8F6' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/owner" element={
          <ProtectedRoute role="owner"><OwnerPage /></ProtectedRoute>
        } />
        <Route path="/walker" element={
          <ProtectedRoute role="walker"><WalkerPage /></ProtectedRoute>
        } />
        <Route path="/tracking" element={
          <ProtectedRoute><TrackingPage /></ProtectedRoute>
        } />
        <Route path="/review" element={
          <ProtectedRoute><ReviewPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/owner-register" element={<OwnerRegisterPage />} />
        <Route path="/walker-register" element={<WalkerRegisterPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/pet-info" element={<PetInfoPage />} />
        <Route path="/walkers" element={<WalkerListPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
