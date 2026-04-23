import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCS7lzr7TOHP787yEE7vRDNf-2pbks7nMg',
  authDomain: 'lfms-da178.firebaseapp.com',
  projectId: 'lfms-da178',
  storageBucket: 'lfms-da178.firebasestorage.app',
  messagingSenderId: '561509312059',
  appId: '1:561509312059:web:c2bcca825040393b7bde1e',
  measurementId: 'G-J6M31Z5VH2',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
