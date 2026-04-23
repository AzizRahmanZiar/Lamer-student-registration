import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role and approval status from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        setUser(firebaseUser);
        setRole(userData?.role || null);
        setApproved(userData?.approved || false);
      } else {
        setUser(null);
        setRole(null);
        setApproved(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { user, role, approved, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
