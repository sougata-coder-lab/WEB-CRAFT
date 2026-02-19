import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Projects from './pages/Projects';
import Builder from './pages/Builder';
import Community from './pages/Community';
import Pricing from './pages/Pricing';
import View from './pages/View';
import Navbar from './components/common/Navbar';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full bounce-dot" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-indigo-500 rounded-full bounce-dot" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-indigo-500 rounded-full bounce-dot" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/projects" replace /> : <>{children}</>;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            fontFamily: 'Outfit, sans-serif',
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/community" element={<><Navbar /><Community /></>} />
        <Route path="/pricing" element={<><Navbar /><Pricing /></>} />
        <Route path="/view/:id" element={<View />} />

        {/* Protected routes - /builder/new MUST come before /builder/:id */}
        <Route path="/projects" element={<ProtectedRoute><><Navbar /><Projects /></></ProtectedRoute>} />
        <Route path="/builder/new" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
        <Route path="/builder/:id" element={<ProtectedRoute><Builder /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
