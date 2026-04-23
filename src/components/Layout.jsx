import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaUserGraduate,
  FaUsers,
  FaMoneyBillWave,
  FaTachometerAlt,
  FaUserCheck,
  FaSignOutAlt,
  FaChalkboard,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Layout() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: FaTachometerAlt,
      roles: ['admin', 'teacher'],
    },
    {
      path: '/students',
      name: 'Students',
      icon: FaUsers,
      roles: ['admin', 'teacher'],
    },
    {
      path: '/fees',
      name: 'Fees',
      icon: FaMoneyBillWave,
      roles: ['admin', 'teacher'],
    },
    {
      path: '/approvals',
      name: 'Approve Teachers',
      icon: FaUserCheck,
      roles: ['admin'],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-gradient-to-r from-blue-700 to-indigo-800 text-white sticky top-0 z-30 shadow-lg'>
        <div className='flex items-center justify-between px-4 py-3 md:px-6'>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className='p-1.5 rounded-md hover:bg-blue-600 transition md:hidden'
            >
              <FaBars size={24} />
            </button>
            {/* Logo and Academy Name */}
            <div className='flex items-center gap-2'>
              <div className='hidden sm:block'>
                <h1 className='text-sm md:text-base font-bold leading-tight'>
                  Lamer Gereshk
                </h1>
                <p className='text-xs text-blue-100 hidden md:block'>
                  English Language & Computer Academy
                </p>
              </div>
              <div className='sm:hidden'>
                <h1 className='text-sm font-bold'>Lamer Academy</h1>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <span className='text-sm hidden sm:inline-block capitalize'>
              {role}
            </span>
            <button
              onClick={handleLogout}
              className='flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-sm transition'
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className='flex flex-1 relative'>
        {/* Desktop Sidebar with Academy Info */}
        <aside className='hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:mt-[57px] bg-white border-r border-gray-200 shadow-sm z-20'>
          {/* Academy branding inside sidebar */}
          <div className='px-4 py-4 border-b border-gray-100'>
            <div className='flex items-center gap-3'>
              <img src='/logo.png' alt='Logo' className='h-8 w-auto' />
              <div>
                <p className='font-bold text-gray-800 text-sm'>Lamer Gereshk</p>
                <p className='text-xs text-gray-500'>English & Computer</p>
              </div>
            </div>
          </div>
          <nav className='flex-1 px-3 py-4 space-y-1.5'>
            {filteredNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
          <div className='p-4 border-t border-gray-100 text-xs text-gray-400'>
            v2.0 • Lamer Academy
          </div>
        </aside>

        {/* Mobile Sidebar Drawer - add academy name */}
        {sidebarOpen && (
          <div
            className='fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden'
            onClick={closeSidebar}
          />
        )}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className='flex justify-between items-center p-4 border-b border-gray-100'>
            <div className='flex items-center gap-2'>
              <FaChalkboard size={24} className='text-blue-600' />
              <div>
                <p className='font-bold text-gray-800'>Lamer Gereshk</p>
                <p className='text-xs text-gray-500'>Academy</p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className='p-1 rounded-md hover:bg-gray-100'
            >
              <FaTimes size={22} />
            </button>
          </div>
          <nav className='flex-1 px-3 py-6 space-y-1.5'>
            {filteredNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className='flex-1 md:ml-64 bg-gray-50 min-h-[calc(100vh-57px)]'>
          <div className='p-4 md:p-6 max-w-7xl mx-auto'>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer with Academy Info */}
      <footer className='bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500 md:ml-64'>
        <p>
          © {new Date().getFullYear()} Lamer Gereshk English Language & Computer
          Academy — All rights reserved.
        </p>
        <p className='text-xs mt-1'>
          Empowering students with quality education
        </p>
      </footer>
    </div>
  );
}
