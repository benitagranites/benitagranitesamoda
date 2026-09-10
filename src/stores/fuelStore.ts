// Benita Granites — Fuel Store (Zustand)
import { create } from 'zustand';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, serverTimestamp, getDoc, onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { FuelEntry } from '@/types';

interface FuelStore {
  entries: FuelEntry[];
  loading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  subscribe: (uid: string) => void;
  add: (data: Omit<FuelEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  update: (id: string, data: Partial<FuelEntry>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Promise<FuelEntry | null>;
  cleanup: () => void;
}

export const useFuelStore = create<FuelStore>((set, get) => ({
  entries: [],
  loading: true,
  error: null,
  unsubscribe: null,

  subscribe: (uid: string) => {
    const prev = get().unsubscribe;
    if (prev) prev();
    set({ loading: true, error: null });

    const q = query(collection(db, 'fuelEntries'), where('createdBy', '==', uid));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const entries = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as FuelEntry[];
        entries.sort((a, b) => {
          const aTime = a.date?.seconds || 0;
          const bTime = b.date?.seconds || 0;
          return bTime - aTime;
        });
        set({ entries, loading: false });
      },
      (error) => {
        console.error('[FuelStore] Error:', error);
        set({ error: error.message, loading: false });
      }
    );
    set({ unsubscribe });
  },

  add: async (data) => {
    const docRef = await addDoc(collection(db, 'fuelEntries'), {
      ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  update: async (id, data) => {
    await updateDoc(doc(db, 'fuelEntries', id), { ...data, updatedAt: serverTimestamp() });
  },

  remove: async (id) => {
    await deleteDoc(doc(db, 'fuelEntries', id));
  },

  get: async (id) => {
    const docSnap = await getDoc(doc(db, 'fuelEntries', id));
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as FuelEntry;
    return null;
  },

  cleanup: () => {
    const unsub = get().unsubscribe;
    if (unsub) unsub();
    set({ unsubscribe: null, entries: [], loading: false });
  },
}));
