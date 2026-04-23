// App.jsx
import { Routes, Route } from 'react-router-dom'; // only Routes, Route
import { DataProvider } from './context/DataContext'; // 👈 import your data context
import Unauthorized from './components/Unauthorized';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Fees from './pages/Fees';
import AdminApprovals from './pages/AdminApprovals';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        {' '}
        {/* 👈 wrap with DataProvider */}
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/unauthorized' element={<Unauthorized />} />
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='students' element={<Students />} />
            <Route path='fees' element={<Fees />} />
            <Route
              path='approvals'
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminApprovals />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
