import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-8 rounded-xl shadow-md text-center max-w-md'>
        <h1 className='text-3xl font-bold text-red-600 mb-4'>Access Denied</h1>
        <p className='text-gray-600 mb-6'>
          You don't have permission to view this page.
        </p>
        <Link to='/' className='bg-blue-600 text-white px-4 py-2 rounded-lg'>
          Go Home
        </Link>
      </div>
    </div>
  );
}
