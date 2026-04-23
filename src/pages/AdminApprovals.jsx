// src/components/AdminApprovals.jsx
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
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

export default function AdminApprovals() {
  const { role } = useAuth();
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [approvedTeachers, setApprovedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

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

  const deleteTeacher = async () => {
    if (teacherToDelete) {
      try {
        await deleteDoc(doc(db, 'users', teacherToDelete.id));
        await fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
      } finally {
        setDeleteModalOpen(false);
        setTeacherToDelete(null);
      }
    }
  };

  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher);
    setDeleteModalOpen(true);
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
    <div className='px-4 sm:px-6 py-4 sm:py-6'>
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>
            Teacher Management
          </h1>
          <p className='text-gray-500 text-xs sm:text-sm mt-1'>
            Approve, edit, or remove teacher accounts
          </p>
        </div>
        <button
          onClick={fetchTeachers}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm'
        >
          <FaSyncAlt size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <p className='text-center py-8'>Loading...</p>
      ) : (
        <>
          {/* Pending Approvals Section */}
          <div className='mb-8'>
            <h2 className='text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2'>
              <FaUserCheck className='text-yellow-600' /> Pending Approval (
              {pendingTeachers.length})
            </h2>
            {pendingTeachers.length === 0 ? (
              <div className='bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm'>
                No pending teacher registrations.
              </div>
            ) : (
              <div className='bg-white rounded-xl shadow overflow-hidden border border-gray-200'>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm min-w-[500px]'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700'>
                          Email
                        </th>
                        <th className='px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700'>
                          Registered
                        </th>
                        <th className='px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingTeachers.map((teacher) => (
                        <tr
                          key={teacher.id}
                          className='border-t hover:bg-gray-50'
                        >
                          <td className='px-4 sm:px-6 py-3 text-xs sm:text-sm break-all'>
                            {teacher.email}
                          </td>
                          <td className='px-4 sm:px-6 py-3 text-xs sm:text-sm'>
                            {teacher.createdAt
                              ?.toDate?.()
                              .toLocaleDateString() || 'Unknown'}
                          </td>
                          <td className='px-4 sm:px-6 py-3 text-center'>
                            <button
                              onClick={() => approveTeacher(teacher.id)}
                              className='bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto text-xs sm:text-sm'
                            >
                              <FaUserCheck size={14} /> Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Approved Teachers Section */}
          <div>
            <h2 className='text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2'>
              <FaUserGraduate className='text-blue-600' /> Active Teachers (
              {approvedTeachers.length})
            </h2>
            {approvedTeachers.length === 0 ? (
              <div className='bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm'>
                No approved teachers yet.
              </div>
            ) : (
              <div className='bg-white rounded-xl shadow overflow-hidden border border-gray-200'>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm min-w-[500px]'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700'>
                          Email
                        </th>
                        <th className='px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700'>
                          Approved On
                        </th>
                        <th className='px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedTeachers.map((teacher) => (
                        <tr
                          key={teacher.id}
                          className='border-t hover:bg-gray-50'
                        >
                          <td className='px-4 sm:px-6 py-3'>
                            {editingTeacher === teacher.id ? (
                              <input
                                type='email'
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className='border rounded px-2 py-1 w-full text-sm'
                                autoFocus
                              />
                            ) : (
                              <span className='text-xs sm:text-sm break-all'>
                                {teacher.email}
                              </span>
                            )}
                          </td>
                          <td className='px-4 sm:px-6 py-3 text-xs sm:text-sm'>
                            {teacher.createdAt
                              ?.toDate?.()
                              .toLocaleDateString() || 'Unknown'}
                          </td>
                          <td className='px-4 sm:px-6 py-3 text-center'>
                            {editingTeacher === teacher.id ? (
                              <div className='flex items-center justify-center gap-2'>
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
                              </div>
                            ) : (
                              <div className='flex items-center justify-center gap-3'>
                                <button
                                  onClick={() => startEdit(teacher)}
                                  className='text-blue-600 hover:text-blue-800'
                                  title='Edit Email'
                                >
                                  <FaEdit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(teacher)}
                                  className='text-red-600 hover:text-red-800'
                                  title='Delete'
                                >
                                  <FaTrash size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteTeacher}
        title='Delete Teacher'
        message={`Are you sure you want to delete teacher ${teacherToDelete?.email || ''}? This action cannot be undone.`}
      />
    </div>
  );
}
