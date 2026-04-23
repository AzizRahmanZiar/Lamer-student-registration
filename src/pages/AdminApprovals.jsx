import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  FaUserCheck,
  FaUserTimes,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaUserGraduate,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function AdminApprovals() {
  const { role } = useAuth();
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [approvedTeachers, setApprovedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editEmail, setEditEmail] = useState('');

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const qPending = query(
        collection(db, 'users'),
        where('role', '==', 'teacher'),
        where('approved', '==', false),
      );
      const pendingSnap = await getDocs(qPending);
      const pending = pendingSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const qApproved = query(
        collection(db, 'users'),
        where('role', '==', 'teacher'),
        where('approved', '==', true),
      );
      const approvedSnap = await getDocs(qApproved);
      const approved = approvedSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPendingTeachers(pending);
      setApprovedTeachers(approved);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== 'admin') return;
    fetchTeachers();
  }, [role]);

  const approveTeacher = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), { approved: true });
      await fetchTeachers();
    } catch (error) {
      console.error('Error approving teacher:', error);
    }
  };

  const deleteTeacher = async (userId) => {
    if (
      window.confirm(
        'Are you sure you want to delete this teacher? This action cannot be undone.',
      )
    ) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        await fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  const startEdit = (teacher) => {
    setEditingTeacher(teacher.id);
    setEditEmail(teacher.email);
  };

  const cancelEdit = () => {
    setEditingTeacher(null);
    setEditEmail('');
  };

  const saveEdit = async (userId) => {
    if (!editEmail.trim()) return;
    try {
      await updateDoc(doc(db, 'users', userId), { email: editEmail });
      await fetchTeachers();
      cancelEdit();
    } catch (error) {
      console.error('Error updating teacher email:', error);
    }
  };

  if (role !== 'admin') {
    return (
      <div className='p-8 text-center text-red-600'>
        Access denied. Admin only.
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>
            Teacher Management
          </h1>
          <p className='text-gray-500 text-sm mt-1'>
            Approve, edit, or remove teacher accounts
          </p>
        </div>
        <button
          onClick={fetchTeachers}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition'
        >
          <FaSyncAlt /> Refresh
        </button>
      </div>

      {loading ? (
        <p className='text-center py-8'>Loading...</p>
      ) : (
        <>
          {/* Pending Approvals Section */}
          <div className='mb-8'>
            <h2 className='text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2'>
              <FaUserCheck className='text-yellow-600' /> Pending Approval (
              {pendingTeachers.length})
            </h2>
            {pendingTeachers.length === 0 ? (
              <div className='bg-gray-50 rounded-lg p-4 text-center text-gray-500'>
                No pending teacher registrations.
              </div>
            ) : (
              <div className='bg-white rounded-xl shadow overflow-hidden border border-gray-200'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left'>Email</th>
                      <th className='px-6 py-3 text-left'>Registered</th>
                      <th className='px-6 py-3 text-center'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTeachers.map((teacher) => (
                      <tr
                        key={teacher.id}
                        className='border-t hover:bg-gray-50'
                      >
                        <td className='px-6 py-3'>{teacher.email}</td>
                        <td className='px-6 py-3'>
                          {teacher.createdAt?.toDate?.().toLocaleDateString() ||
                            'Unknown'}
                        </td>
                        <td className='px-6 py-3 text-center'>
                          <button
                            onClick={() => approveTeacher(teacher.id)}
                            className='bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto'
                          >
                            <FaUserCheck /> Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Approved Teachers Section */}
          <div>
            <h2 className='text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2'>
              <FaUserGraduate className='text-blue-600' /> Active Teachers (
              {approvedTeachers.length})
            </h2>
            {approvedTeachers.length === 0 ? (
              <div className='bg-gray-50 rounded-lg p-4 text-center text-gray-500'>
                No approved teachers yet.
              </div>
            ) : (
              <div className='bg-white rounded-xl shadow overflow-hidden border border-gray-200'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left'>Email</th>
                      <th className='px-6 py-3 text-left'>Approved On</th>
                      <th className='px-6 py-3 text-center'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedTeachers.map((teacher) => (
                      <tr
                        key={teacher.id}
                        className='border-t hover:bg-gray-50'
                      >
                        <td className='px-6 py-3'>
                          {editingTeacher === teacher.id ? (
                            <input
                              type='email'
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className='border rounded px-2 py-1 w-full'
                              autoFocus
                            />
                          ) : (
                            teacher.email
                          )}
                        </td>
                        <td className='px-6 py-3'>
                          {teacher.createdAt?.toDate?.().toLocaleDateString() ||
                            'Unknown'}
                        </td>
                        <td className='px-6 py-3 text-center space-x-2'>
                          {editingTeacher === teacher.id ? (
                            <>
                              <button
                                onClick={() => saveEdit(teacher.id)}
                                className='bg-green-600 text-white px-3 py-1 rounded-lg text-xs'
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className='bg-gray-400 text-white px-3 py-1 rounded-lg text-xs'
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(teacher)}
                                className='text-blue-600 hover:text-blue-800 mr-2'
                                title='Edit Email'
                              >
                                <FaEdit size={18} />
                              </button>
                              <button
                                onClick={() => deleteTeacher(teacher.id)}
                                className='text-red-600 hover:text-red-800'
                                title='Delete'
                              >
                                <FaTrash size={18} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
