// src/components/Students.jsx
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  FaUserPlus,
  FaUsers,
  FaPhone,
  FaUser,
  FaUserCheck,
  FaBookOpen,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const AVAILABLE_COURSES = [
  { id: 'calligraphy', label: 'Calligraphy' },
  { id: 'english', label: 'English' },
  { id: 'math', label: 'Mathematics' },
  { id: 'physics', label: 'Physics' },
  { id: 'computer', label: 'Computer' },
  { id: 'arabic', label: 'Arabic' },
];

export default function Students() {
  const { students, setStudents } = useData();
  const { role } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [form, setForm] = useState({
    fullname: '',
    fathername: '',
    phone: '',
    courses: [],
  });

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async () => {
    if (!form.fullname.trim()) return;
    try {
      if (editingId) {
        const studentRef = doc(db, 'students', editingId);
        await updateDoc(studentRef, {
          fullname: form.fullname,
          fathername: form.fathername,
          phone: form.phone,
          courses: form.courses,
        });
        await fetchStudents();
      } else {
        await addDoc(collection(db, 'students'), {
          fullname: form.fullname,
          fathername: form.fathername,
          phone: form.phone,
          courses: form.courses,
        });
        await fetchStudents();
      }
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteDoc(doc(db, 'students', studentToDelete.id));
        await fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      } finally {
        setDeleteModalOpen(false);
        setStudentToDelete(null);
      }
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
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({ fullname: '', fathername: '', phone: '', courses: [] });
    setEditingId(null);
  };

  const toggleCourse = (courseId) => {
    setForm((prev) => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter((id) => id !== courseId)
        : [...prev.courses, courseId],
    }));
  };

  const getCourseLabels = (courseIds) => {
    if (!courseIds || courseIds.length === 0) return 'None';
    return courseIds
      .map((id) => AVAILABLE_COURSES.find((c) => c.id === id)?.label || id)
      .join(', ');
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.fathername &&
        s.fathername.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.phone && s.phone.includes(searchTerm)),
  );

  return (
    <div className='px-4 sm:px-6 py-4 sm:py-6'>
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2'>
            <FaUsers className='text-blue-600' size={24} />
            Students Directory
          </h1>
          <p className='text-gray-500 text-xs sm:text-sm mt-1'>
            Manage student records and enrolled courses
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className='bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-xl shadow-sm flex items-center justify-center gap-2 font-medium text-sm sm:text-base'
        >
          <FaUserPlus size={16} /> Add Student
        </button>
      </div>

      {/* Search Bar */}
      <div className='mb-4 relative'>
        <FaSearch
          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
          size={14}
        />
        <input
          type='text'
          placeholder='Search by name, father name, or phone...'
          className='w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm min-w-[700px]'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-3 sm:px-6 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm'>
                  Full Name
                </th>
                <th className='px-3 sm:px-6 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm'>
                  Father Name
                </th>
                <th className='px-3 sm:px-6 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm'>
                  Phone
                </th>
                <th className='px-3 sm:px-6 py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm'>
                  Enrolled Courses
                </th>
                <th className='px-3 sm:px-6 py-3 text-center font-semibold text-gray-700 text-xs sm:text-sm'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan='5'
                    className='px-6 py-12 text-center text-gray-400'
                  >
                    <FaUsers size={32} className='mx-auto text-gray-300 mb-2' />
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className='hover:bg-gray-50 transition'>
                    <td className='px-3 sm:px-6 py-3 font-medium text-gray-800 text-xs sm:text-sm'>
                      {student.fullname}
                    </td>
                    <td className='px-3 sm:px-6 py-3 text-gray-600 text-xs sm:text-sm'>
                      {student.fathername || '—'}
                    </td>
                    <td className='px-3 sm:px-6 py-3 text-gray-600 text-xs sm:text-sm'>
                      {student.phone || '—'}
                    </td>
                    <td className='px-3 sm:px-6 py-3 text-gray-600 text-xs sm:text-sm'>
                      {getCourseLabels(student.courses)}
                    </td>
                    <td className='px-3 sm:px-6 py-3 text-center'>
                      {role === 'admin' ? (
                        <div className='flex items-center justify-center gap-2'>
                          <button
                            onClick={() => handleEdit(student)}
                            className='text-blue-600 hover:text-blue-800'
                            title='Edit'
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(student)}
                            className='text-red-600 hover:text-red-800'
                            title='Delete'
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className='text-xs text-gray-400'>
                          (read only)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-md my-8 mx-4'>
            <div className='bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-6 py-4 flex justify-between items-center rounded-t-2xl'>
              <h2 className='text-lg sm:text-xl font-semibold text-white'>
                {editingId ? 'Edit Student' : 'Register New Student'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className='text-white/80 hover:text-white'
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className='p-4 sm:p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Full Name *
                </label>
                <div className='relative'>
                  <FaUser
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                    size={16}
                  />
                  <input
                    type='text'
                    placeholder='e.g., Ahmed Raza'
                    className='w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
                    value={form.fullname}
                    onChange={(e) =>
                      setForm({ ...form, fullname: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Father Name
                </label>
                <div className='relative'>
                  <FaUserCheck
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                    size={16}
                  />
                  <input
                    type='text'
                    placeholder='e.g., Raza Khan'
                    className='w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
                    value={form.fathername}
                    onChange={(e) =>
                      setForm({ ...form, fathername: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Phone Number
                </label>
                <div className='relative'>
                  <FaPhone
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                    size={16}
                  />
                  <input
                    type='text'
                    placeholder='+92 XXX XXXXXXX'
                    className='w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm'
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1'>
                  <FaBookOpen size={14} /> Enrolled Courses
                </label>
                <div className='grid grid-cols-2 gap-2 border border-gray-200 rounded-lg p-3 bg-gray-50'>
                  {AVAILABLE_COURSES.map((course) => (
                    <label
                      key={course.id}
                      className='flex items-center gap-2 text-sm text-gray-700'
                    >
                      <input
                        type='checkbox'
                        checked={form.courses.includes(course.id)}
                        onChange={() => toggleCourse(course.id)}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      {course.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className='flex flex-col sm:flex-row justify-end gap-3 px-4 sm:px-6 pb-6'>
              <button
                onClick={() => setShowModal(false)}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm'
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className='px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition font-medium text-sm'
              >
                {editingId ? 'Update Student' : 'Save Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Delete Student'
        message={`Are you sure you want to delete ${studentToDelete?.fullname || 'this student'}? This action cannot be undone.`}
      />
    </div>
  );
}
