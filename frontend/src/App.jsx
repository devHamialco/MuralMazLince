import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import AnnouncementDetail from './pages/AnnouncementDetail';
import EntrepreneurDashboard from './pages/EntrepreneurDashboard';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import ToastNotification from './components/ToastNotification';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/announcement/:id" element={<AnnouncementDetail />} />

        {/* Rutas de emprendedor */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['entrepreneur', 'admin']}>
              <EntrepreneurDashboard />
            </PrivateRoute>
          }
        />

        {/* Rutas de administrador */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminPanel />
            </PrivateRoute>
          }
        />

        {/* Ruta catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastNotification />
    </div>
  );
}

export default App;