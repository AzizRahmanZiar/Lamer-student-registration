import { createContext, useContext, useEffect, useState } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, serverTimestamp, getDoc, setDoc,
  query, where, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const DataContext = createContext();
export function useData() { return useContext(DataContext); }

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function DataProvider({ children }) {
  const { user, role } = useAuth();
  const [students, setStudents] = useState([]);
  const [monthlyFees, setMonthlyFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyDueDay, setMonthlyDueDay] = useState(10);
  const [teachers, setTeachers] = useState([]);
  const [teacherPermissions, setTeacherPermissions] = useState({});

  const isAdmin = role === 'admin';
  const uid = user?.uid;

  // Fetch teachers and their permissions (admin only)
  const fetchTeachersAndPermissions = async () => {
    if (!isAdmin) return;
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const snapshot = await getDocs(q);
      const teacherData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(teacherData);

      const permSnapshot = await getDocs(collection(db, 'teacherPermissions'));
      const perms = {};
      permSnapshot.docs.forEach(doc => {
        perms[doc.id] = doc.data().canEdit || false;
      });
      setTeacherPermissions(perms);
    } catch (error) {
      console.error('Error fetching teachers/permissions:', error);
    }
  };

  // Load settings & teachers on mount
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'global'));
        if (snap.exists()) {
          const data = snap.data();
          setMonthlyDueDay(data.monthlyDueDay || 10);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();

    if (isAdmin) {
      fetchTeachersAndPermissions();
    }

    // Real-time listeners for students and fees (filtered by createdBy)
    const studentsRef = isAdmin
      ? collection(db, 'students')
      : query(collection(db, 'students'), where('createdBy', '==', uid));
    const unsubStudents = onSnapshot(studentsRef, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const feesRef = isAdmin
      ? collection(db, 'monthlyFees')
      : query(collection(db, 'monthlyFees'), where('createdBy', '==', uid));
    const unsubMonthlyFees = onSnapshot(feesRef, (snapshot) => {
      setMonthlyFees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubStudents();
      unsubMonthlyFees();
    };
  }, [user, isAdmin, uid]);

  // Helper: get current user's edit permission
  const getCurrentUserCanEdit = () => {
    if (isAdmin) return true;
    if (role === 'teacher' && user) {
      return teacherPermissions[user.uid] || false;
    }
    return false;
  };

  // Update teacher permission
  const updateTeacherPermission = async (teacherUid, canEdit) => {
    try {
      await setDoc(doc(db, 'teacherPermissions', teacherUid), { canEdit }, { merge: true });
      setTeacherPermissions(prev => ({ ...prev, [teacherUid]: canEdit }));
    } catch (error) {
      console.error('Error updating teacher permission:', error);
      throw error;
    }
  };

  // CRUD operations with createdBy/createdByEmail
  const addMonthlyFee = async (data) => {
    await addDoc(collection(db, 'monthlyFees'), {
      ...data,
      createdBy: uid,
      createdByEmail: user?.email || '',
      createdAt: serverTimestamp(),
    });
  };

  const updateMonthlyFee = async (id, data) => {
    await updateDoc(doc(db, 'monthlyFees', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteMonthlyFee = async (id) => {
    await deleteDoc(doc(db, 'monthlyFees', id));
  };

  const addStudent = async (data) => {
    await addDoc(collection(db, 'students'), {
      ...data,
      createdBy: uid,
      createdByEmail: user?.email || '',
      createdAt: serverTimestamp(),
    });
  };

  const updateStudent = async (id, data) => {
    await updateDoc(doc(db, 'students', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteStudent = async (id) => {
    await deleteDoc(doc(db, 'students', id));
  };

  const updateMonthlyDueDay = async (day) => {
    await setDoc(doc(db, 'settings', 'global'), { monthlyDueDay: day }, { merge: true });
    setMonthlyDueDay(day);
  };

  // Helpers
  const getCurrentMonthYear = () => {
    const now = new Date();
    return {
      month: monthNames[now.getMonth()],
      year: now.getFullYear(),
      monthIndex: now.getMonth()
    };
  };

  const getCurrentMonthCollected = () => {
    const { month, year } = getCurrentMonthYear();
    return monthlyFees
      .filter(f => f.month === month && f.year === year && f.status === 'paid')
      .reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  };

  const getPendingStudents = () => {
    const { month, year } = getCurrentMonthYear();
    const paidIds = monthlyFees
      .filter(f => f.month === month && f.year === year && f.status === 'paid')
      .map(f => f.studentId);
    return students.filter(s => !paidIds.includes(s.id));
  };

  return (
    <DataContext.Provider value={{
      students,
      monthlyFees,
      loading,
      monthlyDueDay,
      teachers,
      teacherPermissions,
      getCurrentUserCanEdit,
      updateTeacherPermission,
      getCurrentMonthCollected,
      getPendingStudents,
      getCurrentMonthYear,
      addMonthlyFee,
      updateMonthlyFee,
      deleteMonthlyFee,
      addStudent,
      updateStudent,
      deleteStudent,
      updateMonthlyDueDay,
    }}>
      {children}
    </DataContext.Provider>
  );
}