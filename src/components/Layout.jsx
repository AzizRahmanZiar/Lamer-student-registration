import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
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

  // Close sidebar on window resize (if screen becomes desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      path: '/monthly-fees',
      name: 'Monthly Fees',
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
      {/* Header - fixed on mobile, relative on desktop */}
      <header className='bg-gradient-to-r from-blue-700 to-indigo-800 text-white sticky top-0 z-30 shadow-lg'>
        <div className='flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 md:px-6'>
          <div className='flex items-center gap-2 min-w-0'>
            <button
              onClick={() => setSidebarOpen(true)}
              className='p-1.5 rounded-md hover:bg-blue-600 transition md:hidden flex-shrink-0'
              aria-label='Open menu'
            >
              <FaBars size={22} />
            </button>
            <div className='truncate'>
              <h1 className='text-sm font-bold leading-tight sm:text-base'>
                Lamer Gereshk
              </h1>
              <p className='text-xs text-blue-100 hidden sm:block truncate'>
                English Language & Computer Academy
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 sm:gap-4 flex-shrink-0'>
            <span className='text-xs sm:text-sm capitalize hidden xs:inline-block'>
              {role}
            </span>
            <button
              onClick={handleLogout}
              className='flex items-center gap-1 sm:gap-2 bg-red-500 hover:bg-red-600 px-2 py-1.5 sm:px-3 rounded-lg text-xs sm:text-sm transition whitespace-nowrap'
            >
              <FaSignOutAlt size={14} className='sm:text-base' />
              <span className='hidden sm:inline'>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className='flex flex-1 relative'>
        {/* Desktop Sidebar */}
        <aside className='hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:mt-[57px] bg-white border-r border-gray-200 shadow-sm z-20'>
          <div className='px-4 py-4 border-b border-gray-100'>
            <div className='flex items-center gap-3'>
              <img src='/logo.png' alt='Logo' className='h-8 w-auto' />
              <div>
                <p className='font-bold text-gray-800 text-sm'>Lamer Gereshk</p>
                <p className='text-xs text-gray-500'>English & Computer</p>
              </div>
            </div>
          </div>
          <nav className='flex-1 px-3 py-4 space-y-1.5 overflow-y-auto'>
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

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div
            className='fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden'
            onClick={closeSidebar}
            aria-hidden='true'
          />
        )}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className='flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0'>
            <div className='flex items-center gap-2'>
              <img src='/logo.png' alt='Logo' className='h-8 w-auto' />
              <div>
                <p className='font-bold text-gray-800'>Lamer Gereshk</p>
                <p className='text-xs text-gray-500'>Academy</p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className='p-1 rounded-md hover:bg-gray-100'
              aria-label='Close menu'
            >
              <FaTimes size={22} />
            </button>
          </div>
          <nav className='flex-1 px-3 py-6 space-y-1.5 overflow-y-auto'>
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
        <main className='flex-1 md:ml-64 bg-gray-50 w-full min-w-0'>
          <div className='p-3 sm:p-4 md:p-6 max-w-7xl mx-auto'>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className='bg-white border-t border-gray-200 py-3 px-4 text-center text-xs text-gray-500 md:ml-64'>
        <p>
          © {new Date().getFullYear()} Lamer Gereshk English Language & Computer
          Academy — All rights reserved.
        </p>
        <p className='text-[11px] mt-1'>
          Empowering students with quality education
        </p>
      </footer>
    </div>
  );
}
