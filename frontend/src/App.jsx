/* App - Mural Maz Lince */
/* Sprint 11 - Frontend */

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import AnnouncementDetail from './pages/AnnouncementDetail';
import EntrepreneurDashboard from './pages/EntrepreneurDashboard';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import ToastNotification from './components/ToastNotification';

function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const { toast, setToast } = useNotification();

  if (loading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: 'var(--bg-base)',
        }}
      >
        <div 
          style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid var(--border)', 
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} 
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Routes>
        {/* Ruta pública por defecto - redirige a Feed */}
        <Route 
          path="/" 
          element={<Feed />} 
        />
        
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
        />
        
        {/* Anuncio detalle */}
        <Route 
          path="/announcement/:id" 
          element={<AnnouncementDetail />} 
        />
        
        {/* Dashboard del emprendedor */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute allowedRoles={['entrepreneur', 'admin']}>
              <EntrepreneurDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Panel de administrador */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminPanel />
            </PrivateRoute>
          } 
        />
        
        {/* Ruta catch-all */}
        <Route 
          path="*" 
          element={<Navigate to="/" />} 
        />
      </Routes>
      
      {/* Toast global */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}