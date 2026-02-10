import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import { ProtectedRoute, UserRoute, OwnerRoute, AdminRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TurfList from './pages/TurfList';
import TurfDetails from './pages/TurfDetails';
import MyBookings from './pages/MyBookings';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import TurfForm from './pages/owner/TurfForm';
import TurfBookings from './pages/owner/TurfBookings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTurfs from './pages/admin/AdminTurfs';
import AdminReports from './pages/admin/AdminReports';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="turfs" element={<TurfList />} />
            <Route path="turfs/:id" element={<TurfDetails />} />

            {/* User Routes */}
            <Route
              path="my-bookings"
              element={
                <UserRoute>
                  <MyBookings />
                </UserRoute>
              }
            />

            {/* Owner Routes */}
            <Route
              path="owner"
              element={
                <OwnerRoute>
                  <OwnerDashboard />
                </OwnerRoute>
              }
            />
            <Route
              path="owner/turfs/new"
              element={
                <OwnerRoute>
                  <TurfForm />
                </OwnerRoute>
              }
            />
            <Route
              path="owner/turfs/:id/edit"
              element={
                <OwnerRoute>
                  <TurfForm />
                </OwnerRoute>
              }
            />
            <Route
              path="owner/turfs/:id/bookings"
              element={
                <OwnerRoute>
                  <TurfBookings />
                </OwnerRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="admin/turfs"
              element={
                <AdminRoute>
                  <AdminTurfs />
                </AdminRoute>
              }
            />
            <Route
              path="admin/reports"
              element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
