import { useState } from 'react';
import { db } from '../firebase';
import { FaUserPlus, FaUsers, FaPhone, FaUser, FaUserCheck, FaBookOpen, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { useModal } from '../hooks/useModal';

const AVAILABLE_COURSES = [
  { id: 'calligraphy', label: 'Calligraphy' },
  { id: 'english', label: 'English' },
  { id: 'math', label: 'Mathematics' },
  { id: 'physics', label: 'Physics' },
  { id: 'computer', label: 'Computer' },
  { id: 'arabic', label: 'Arabic' },
];

export default function Students() {
  const { students, addStudent, updateStudent, deleteStudent, getCurrentUserCanEdit } = useData();
  const { role } = useAuth();
  const modal = useModal(false);
  const deleteModal = useModal(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [form, setForm] = useState({ fullname: '', fathername: '', phone: '', courses: [] });

  const canEdit = getCurrentUserCanEdit();

  const resetForm = () => {
    setForm({ fullname: '', fathername: '', phone: '', courses: [] });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.fullname.trim()) return;
    try {
      if (editingId) {
        await updateStudent(editingId, {
          fullname: form.fullname,
          fathername: form.fathername,
          phone: form.phone,
          courses: form.courses,
        });
      } else {
        await addStudent({
          fullname: form.fullname,
          fathername: form.fathername,
          phone: form.phone,
          courses: form.courses,
        });
      }
      resetForm();
      modal.close();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setForm({
      fullname: student.fullname,
      fathername: student.fathername || '',
      phone: student.phone || '',
      courses: student.courses || [],
    });
    modal.open();
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteStudent(studentToDelete.id);
      } catch (error) {
        console.error('Error deleting student:', error);
      } finally {
        deleteModal.close();
        setStudentToDelete(null);
      }
    }
  };

  const toggleCourse = (courseId) => {
    setForm(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(id => id !== courseId)
        : [...prev.courses, courseId],
    }));
  };

  const getCourseLabels = (courseIds) => {
    if (!courseIds || courseIds.length === 0) return 'None';
    return courseIds
      .map(id => AVAILABLE_COURSES.find(c => c.id === id)?.label || id)
      .join(', ');
  };

  const filteredStudents = students.filter(s =>
    s.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.fathername && s.fathername.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.phone && s.phone.includes(searchTerm))
  );

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      <PageHeader
        title="Students Directory"
        subtitle="Manage student records and enrolled courses"
        actions={[
          {
            children: 'Add Student',
            icon: FaUserPlus,
            onClick: () => { resetForm(); modal.open(); },
            variant: 'primary'
          }
        ]}
      />

      <div className="mb-4 relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input
          type="text"
          placeholder="Search by name, father name, or phone..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table headers={['Full Name', 'Father Name', 'Phone', 'Enrolled Courses', 'Actions']}>
        {filteredStudents.length === 0 ? (
          <tr>
            <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
              <FaUsers size={32} className="mx-auto text-gray-300 mb-2" />
              No students found
            </td>
          </tr>
        ) : (
          filteredStudents.map(student => (
            <tr key={student.id} className="hover:bg-gray-50 transition">
              <td className="px-3 sm:px-6 py-3 font-medium text-gray-800 text-xs sm:text-sm">
                {student.fullname}
              </td>
              <td className="px-3 sm:px-6 py-3 text-gray-600 text-xs sm:text-sm">
                {student.fathername || '—'}
              </td>
              <td className="px-3 sm:px-6 py-3 text-gray-600 text-xs sm:text-sm">
                {student.phone || '—'}
              </td>
              <td className="px-3 sm:px-6 py-3 text-gray-600 text-xs sm:text-sm">
                {getCourseLabels(student.courses)}
              </td>
              <td className="px-3 sm:px-6 py-3 text-center">
                {canEdit ? (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(student)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">(view only)</span>
                )}
              </td>
            </tr>
          ))
        )}
      </Table>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title={editingId ? 'Edit Student' : 'Register New Student'} maxWidth="max-w-md">
        <Input
          label="Full Name *"
          icon={FaUser}
          value={form.fullname}
          onChange={(e) => setForm({ ...form, fullname: e.target.value })}
          placeholder="e.g., Ahmad Raza"
        />
        <Input
          label="Father Name"
          icon={FaUserCheck}
          value={form.fathername}
          onChange={(e) => setForm({ ...form, fathername: e.target.value })}
          placeholder="e.g., Raza Khan"
        />
        <Input
          label="Phone Number"
          icon={FaPhone}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+93 XXX XXXXXXX"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <FaBookOpen size={14} /> Enrolled Courses
          </label>
          <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
            {AVAILABLE_COURSES.map(course => (
              <label key={course.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.courses.includes(course.id)}
                  onChange={() => toggleCourse(course.id)}
                  className="rounded border-gray-300 text-blue-600"
                />
                {course.label}
              </label>
            ))}
          </div>
        </div>

        {/* ✅ Footer buttons fixed */}
        <div className="flex justify-end gap-3 mt-4 border-t pt-4">
          <Button variant="outline" onClick={modal.close}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingId ? 'Update Student' : 'Save Student'}
          </Button>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${studentToDelete?.fullname || 'this student'}? This action cannot be undone.`}
      />
    </div>
  );
}