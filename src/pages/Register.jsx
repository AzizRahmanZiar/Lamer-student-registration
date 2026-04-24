import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [adminExists, setAdminExists] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'admin'));
      const snapshot = await getDocs(q);
      setAdminExists(!snapshot.empty);
      if (snapshot.empty) setRole('admin');
      else setRole('teacher');
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;
      await setDoc(doc(db, 'users', uid), {
        email,
        role,
        approved: role === 'admin' ? true : false,
        createdAt: new Date(),
      });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Main content */}
      <div className='flex-grow flex items-center justify-center p-4'>
        <div className='bg-white p-8 rounded-xl shadow-md w-full max-w-md'>
          {/* Logo */}
          <div className='flex justify-center mb-4'>
            <img src='/logo.png' alt='Logo' className='h-12 w-auto' />
          </div>
          <h2 className='text-2xl font-bold text-center mb-6'>Register</h2>
          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label className='block text-gray-700 mb-1'>Email</label>
              <input
                type='email'
                className='w-full border rounded-lg px-3 py-2'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className='mb-4'>
              <label className='block text-gray-700 mb-1'>Password</label>
              <input
                type='password'
                className='w-full border rounded-lg px-3 py-2'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className='mb-6'>
              <label className='block text-gray-700 mb-1'>Role</label>
              <select
                className='w-full border rounded-lg px-3 py-2'
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={adminExists}
              >
                <option value='teacher'>Teacher</option>
                {!adminExists && <option value='admin'>Administrator</option>}
              </select>
              {adminExists && (
                <p className='text-xs text-gray-500 mt-1'>
                  Only one admin allowed. You'll register as teacher and need
                  admin approval.
                </p>
              )}
            </div>
            {error && <div className='mb-4 text-red-600 text-sm'>{error}</div>}
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50'
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          <p className='text-center text-sm text-gray-600 mt-4'>
            Already have an account?{' '}
            <Link to='/login' className='text-blue-600'>
              Login
            </Link>
          </p>
        </div>
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
