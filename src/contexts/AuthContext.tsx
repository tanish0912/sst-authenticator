'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (!email?.endsWith('@sst.scaler.com')) {
        await signOut(auth);
        toast.error('Please use your Scaler email address');
        return;
      }

      // Check for existing session
      const sessionDoc = await getDoc(doc(db, 'sessions', result.user.uid));
      if (sessionDoc.exists()) {
        await signOut(auth);
        toast.error('Another session is active. Please log out from other devices first.');
        return;
      }

      // Create new session
      await setDoc(doc(db, 'sessions', result.user.uid), {
        email: result.user.email,
        lastActive: new Date().toISOString(),
      });

      // Extract roll number from email
      const rollNumber = email.split('@')[0].split('.')[1].toUpperCase();
      
      // Verify student exists in database
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('rollNo', '==', rollNumber));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        await signOut(auth);
        toast.error('Student record not found');
        return;
      }

      const studentDoc = querySnapshot.docs[0];

      // Check if user is admin
      const isAdmin = email.includes('admin');
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Failed to sign in');
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await deleteDoc(doc(db, 'sessions', user.uid));
      }
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
