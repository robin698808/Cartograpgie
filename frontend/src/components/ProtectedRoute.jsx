import { Navigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#08080F', color: '#6B6B9A', fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        Chargement...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
