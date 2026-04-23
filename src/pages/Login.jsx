import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      if (!userData.approved) {
        await auth.signOut();
        throw new Error(
          'Your account is pending approval by the administrator.',
        );
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
      <div className='bg-white p-8 rounded-xl shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold text-center mb-6'>Login</h2>
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
          <div className='mb-6'>
            <label className='block text-gray-700 mb-1'>Password</label>
            <input
              type='password'
              className='w-full border rounded-lg px-3 py-2'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className='mb-4 text-red-600 text-sm'>{error}</div>}
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50'
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className='text-center text-sm text-gray-600 mt-4'>
          Don't have an account?{' '}
          <Link to='/register' className='text-blue-600'>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
