// Benita Granites — Auth Store (Zustand)
import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/firebase/config';
import type { AppUser } from '@/types';
import type { UserRole } from '@/constants';

interface AuthState {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  initialize: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  fetchProfile: (uid: string) => Promise<AppUser | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,
  initialized: false,

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await get().fetchProfile(user.uid);
          set({ user, profile, loading: false, initialized: true });
        } catch (err) {
          console.error('[Auth] Error fetching profile during init:', err);
          set({ user, profile: null, loading: false, initialized: true });
        }
      } else {
        set({ user: null, profile: null, loading: false, initialized: true });
      }
    });
    return unsubscribe;
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await get().fetchProfile(result.user.uid);
      set({ user: result.user, profile, loading: false });
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      const errorCode = firebaseError.code || firebaseError.message || 'Login failed';
      console.error('[Auth] Login error:', errorCode, error);
      set({ loading: false, error: errorCode });
      throw error;
    }
  },

  signup: async (email: string, password: string, username: string) => {
    set({ loading: true, error: null });
    try {
      console.log('[Auth] Creating user with email/password...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;
      console.log('[Auth] User created in Firebase Auth, UID:', uid);

      // Create user document in Firestore
      const userData = {
        uid,
        username,
        email,
        photoURL: null,
        authProvider: 'email' as const,
        role: 'operator' as UserRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      };

      console.log('[Auth] Writing user profile to Firestore...');
      await setDoc(doc(db, 'users', uid), userData);
      console.log('[Auth] Profile written successfully.');

      const profile = await get().fetchProfile(uid);
      set({ user: result.user, profile, loading: false });
      console.log('[Auth] Signup complete.');
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      const errorCode = firebaseError.code || firebaseError.message || 'Signup failed';
      console.error('[Auth] Signup error:', errorCode, error);
      set({ loading: false, error: errorCode });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user.uid;

      // Check if user document exists
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const userData = {
          uid,
          username: result.user.displayName || 'User',
          email: result.user.email || '',
          photoURL: result.user.photoURL || null,
          authProvider: 'google' as const,
          role: 'operator' as UserRole,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
        };
        await setDoc(userDocRef, userData);
      }

      const profile = await get().fetchProfile(uid);
      set({ user: result.user, profile, loading: false });
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      const errorCode = firebaseError.code || firebaseError.message || 'Google login failed';
      console.error('[Auth] Google login error:', errorCode, error);
      set({ loading: false, error: errorCode });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await signOut(auth);
      set({ user: null, profile: null, loading: false });
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error('[Auth] Logout error:', error);
      set({
        loading: false,
        error: firebaseError.code || firebaseError.message || 'Logout failed',
      });
    }
  },

  resetPassword: async (email: string) => {
    set({ loading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ loading: false });
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      const errorCode = firebaseError.code || firebaseError.message || 'Password reset failed';
      console.error('[Auth] Password reset error:', errorCode, error);
      set({ loading: false, error: errorCode });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  fetchProfile: async (uid: string): Promise<AppUser | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as AppUser;
      }
      return null;
    } catch (err) {
      console.error('[Auth] Error fetching profile:', err);
      return null;
    }
  },
}));
