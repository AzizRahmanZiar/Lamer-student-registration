import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FaUserCheck, FaEdit, FaTrash, FaSyncAlt, FaUserGraduate } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import Button from '../components/Button';
import { useModal } from '../hooks/useModal';

export default function AdminApprovals() {
  const { role } = useAuth();
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [approvedTeachers, setApprovedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const deleteModal = useModal(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const qPending = query(collection(db, 'users'), where('role', '==', 'teacher'), where('approved', '==', false));
      const pendingSnap = await getDocs(qPending);
      setPendingTeachers(pendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const qApproved = query(collection(db, 'users'), where('role', '==', 'teacher'), where('approved', '==', true));
      const approvedSnap = await getDocs(qApproved);
      setApprovedTeachers(approvedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error('Error fetching teachers:', error); } finally { setLoading(false); }
  };

  useEffect(() => { if (role !== 'admin') return; fetchTeachers(); }, [role]);

  const approveTeacher = async (userId) => {
    try { await updateDoc(doc(db, 'users', userId), { approved: true }); await fetchTeachers(); }
    catch (error) { console.error('Error approving teacher:', error); }
  };

  const deleteTeacher = async () => {
    if (teacherToDelete) {
      try { await deleteDoc(doc(db, 'users', teacherToDelete.id)); await fetchTeachers(); }
      catch (error) { console.error('Error deleting teacher:', error); }
      finally { deleteModal.close(); setTeacherToDelete(null); }
    }
  };

  const handleDeleteClick = (teacher) => { setTeacherToDelete(teacher); deleteModal.open(); };
  const startEdit = (teacher) => { setEditingTeacher(teacher.id); setEditEmail(teacher.email); };
  const cancelEdit = () => { setEditingTeacher(null); setEditEmail(''); };
  const saveEdit = async (userId) => {
    if (!editEmail.trim()) return;
    try { await updateDoc(doc(db, 'users', userId), { email: editEmail }); await fetchTeachers(); cancelEdit(); }
    catch (error) { console.error('Error updating teacher email:', error); }
  };

  if (role !== 'admin') return <div className="p-8 text-center text-red-600">Access denied. Admin only.</div>;

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      <PageHeader
        title="Teacher Management"
        subtitle="Approve, edit, or remove teacher accounts"
        actions={[{ children: 'Refresh', icon: FaSyncAlt, onClick: fetchTeachers, variant: 'primary' }]}
      />
      {loading ? <p className="text-center py-8">Loading...</p> : (
        <>
          <div className="mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaUserCheck className="text-yellow-600" /> Pending Approval ({pendingTeachers.length})
            </h2>
            {pendingTeachers.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">No pending teacher registrations.</div>
            ) : (
              <Table headers={['Email', 'Registered', 'Action']} className="min-w-[500px]">
                {pendingTeachers.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm break-all">{teacher.email}</td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">{teacher.createdAt?.toDate?.().toLocaleDateString() || 'Unknown'}</td>
                    <td className="px-4 sm:px-6 py-3 text-center">
                      <Button variant="success" size="sm" icon={FaUserCheck} onClick={() => approveTeacher(teacher.id)}>Approve</Button>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaUserGraduate className="text-blue-600" /> Active Teachers ({approvedTeachers.length})
            </h2>
            {approvedTeachers.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">No approved teachers yet.</div>
            ) : (
              <Table headers={['Email', 'Approved On', 'Actions']} className="min-w-[500px]">
                {approvedTeachers.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3">
                      {editingTeacher === teacher.id ? (
                        <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="border rounded px-2 py-1 w-full text-sm" autoFocus />
                      ) : (
                        <span className="text-xs sm:text-sm break-all">{teacher.email}</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">{teacher.createdAt?.toDate?.().toLocaleDateString() || 'Unknown'}</td>
                    <td className="px-4 sm:px-6 py-3 text-center">
                      {editingTeacher === teacher.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="success" size="sm" onClick={() => saveEdit(teacher.id)}>Save</Button>
                          <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => startEdit(teacher)} className="text-blue-600 hover:text-blue-800" title="Edit Email"><FaEdit size={16} /></button>
                          <button onClick={() => handleDeleteClick(teacher)} className="text-red-600 hover:text-red-800" title="Delete"><FaTrash size={16} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={deleteTeacher}
        title="Delete Teacher"
        message={`Are you sure you want to delete teacher ${teacherToDelete?.email || ''}? This action cannot be undone.`}
      />
    </div>
  );
}