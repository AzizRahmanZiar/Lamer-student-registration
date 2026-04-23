// App.jsx
import { Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Unauthorized from './components/Unauthorized';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import MonthlyFeeEntry from './pages/MonthlyFeeEntry'; // 👈 new monthly fee component
import AdminApprovals from './pages/AdminApprovals';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
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
            <Route path='monthly-fees' element={<MonthlyFeeEntry />} />{' '}
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
