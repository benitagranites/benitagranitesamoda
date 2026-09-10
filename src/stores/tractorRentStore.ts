// Benita Granites — Tractor Rent Store (Zustand)
import { create } from 'zustand';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, serverTimestamp, getDoc, onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { TractorRental } from '@/types';

interface TractorRentStore {
  rentals: TractorRental[];
  loading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  subscribe: (uid: string) => void;
  add: (data: Omit<TractorRental, 'id' | 'createdAt'>) => Promise<string>;
  update: (id: string, data: Partial<TractorRental>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Promise<TractorRental | null>;
  cleanup: () => void;
}

export const useTractorRentStore = create<TractorRentStore>((set, get) => ({
  rentals: [],
  loading: true,
  error: null,
  unsubscribe: null,

  subscribe: (uid: string) => {
    const prev = get().unsubscribe;
    if (prev) prev();
    set({ loading: true, error: null });

    const q = query(collection(db, 'tractorRentals'), where('createdBy', '==', uid));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const rentals = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TractorRental[];
        rentals.sort((a, b) => {
          const aTime = a.date?.seconds || 0;
          const bTime = b.date?.seconds || 0;
          return bTime - aTime;
        });
        set({ rentals, loading: false });
      },
      (error) => {
        console.error('[TractorRentStore] Error:', error);
        set({ error: error.message, loading: false });
      }
    );
    set({ unsubscribe });
  },

  add: async (data) => {
    const docRef = await addDoc(collection(db, 'tractorRentals'), {
      ...data, createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  update: async (id, data) => {
    await updateDoc(doc(db, 'tractorRentals', id), { ...data });
  },

  remove: async (id) => {
    await deleteDoc(doc(db, 'tractorRentals', id));
  },

  get: async (id) => {
    const docSnap = await getDoc(doc(db, 'tractorRentals', id));
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as TractorRental;
    return null;
  },

  cleanup: () => {
    const unsub = get().unsubscribe;
    if (unsub) unsub();
    set({ unsubscribe: null, rentals: [], loading: false });
  },
}));
