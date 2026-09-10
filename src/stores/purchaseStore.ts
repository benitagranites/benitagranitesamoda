// Benita Granites — Purchase Store (Zustand)
import { create } from 'zustand';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, serverTimestamp, getDoc, onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Purchase } from '@/types';

interface PurchaseStore {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  subscribe: (uid: string) => void;
  add: (data: Omit<Purchase, 'id' | 'createdAt'>) => Promise<string>;
  update: (id: string, data: Partial<Purchase>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Promise<Purchase | null>;
  cleanup: () => void;
}

export const usePurchaseStore = create<PurchaseStore>((set, get) => ({
  purchases: [],
  loading: true,
  error: null,
  unsubscribe: null,

  subscribe: (uid: string) => {
    const prev = get().unsubscribe;
    if (prev) prev();
    set({ loading: true, error: null });

    const q = query(collection(db, 'purchases'), where('createdBy', '==', uid));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const purchases = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Purchase[];
        purchases.sort((a, b) => {
          const aTime = a.date?.seconds || 0;
          const bTime = b.date?.seconds || 0;
          return bTime - aTime;
        });
        set({ purchases, loading: false });
      },
      (error) => {
        console.error('[PurchaseStore] Error:', error);
        set({ error: error.message, loading: false });
      }
    );
    set({ unsubscribe });
  },

  add: async (data) => {
    const docRef = await addDoc(collection(db, 'purchases'), {
      ...data, createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  update: async (id, data) => {
    await updateDoc(doc(db, 'purchases', id), { ...data });
  },

  remove: async (id) => {
    await deleteDoc(doc(db, 'purchases', id));
  },

  get: async (id) => {
    const docSnap = await getDoc(doc(db, 'purchases', id));
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as Purchase;
    return null;
  },

  cleanup: () => {
    const unsub = get().unsubscribe;
    if (unsub) unsub();
    set({ unsubscribe: null, purchases: [], loading: false });
  },
}));
