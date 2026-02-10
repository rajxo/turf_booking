import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './common/Loading';

// Protected route - requires authentication
export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading text="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// User route - only for users
export const UserRoute = ({ children }) => {
    const { isAuthenticated, isUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading text="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isUser) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Owner route - only for owners
export const OwnerRoute = ({ children }) => {
    const { isAuthenticated, isOwner, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading text="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isOwner) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Admin route - only for admins
export const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading text="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};
