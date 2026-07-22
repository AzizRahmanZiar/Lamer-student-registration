import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Unauthorized from './components/Unauthorized';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import MonthlyFeeEntry from './pages/MonthlyFeeEntry';
import AdminApprovals from './pages/AdminApprovals';
import Settings from './pages/Settings';

const IndexRedirect = () => {
  const { role } = useAuth();
  if (role === 'admin') return <Dashboard />;
  return <Navigate to="/students" replace />;
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<IndexRedirect />} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="students" element={<Students />} />
            <Route path="monthly-fees" element={<MonthlyFeeEntry />} />
            <Route path="approvals" element={<ProtectedRoute allowedRoles={['admin']}><AdminApprovals /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
          </Route>
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;