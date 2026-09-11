// Benita Granites — Kitchen Store (Zustand)
import { create } from 'zustand';
import {
  collection, addDoc, updateDoc, doc,
  query, where, serverTimestamp, onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { KitchenEntry, KitchenStaff } from '@/types';

interface KitchenStore {
  entries: KitchenEntry[];
  staff: KitchenStaff[];
  loading: boolean;
  error: string | null;
  unsubscribeEntries: Unsubscribe | null;
  unsubscribeStaff: Unsubscribe | null;

  subscribe: (uid: string) => void;
  
  addEntry: (data: Omit<KitchenEntry, 'id' | 'createdAt'>) => Promise<string>;
  updateEntry: (id: string, data: Partial<KitchenEntry>) => Promise<void>;
  
  addStaff: (data: Omit<KitchenStaff, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateStaff: (id: string, data: Partial<KitchenStaff>) => Promise<void>;
  
  cleanup: () => void;
}

export const useKitchenStore = create<KitchenStore>((set, get) => ({
  entries: [],
  staff: [],
  loading: true,
  error: null,
  unsubscribeEntries: null,
  unsubscribeStaff: null,

  subscribe: (uid: string) => {
    const prevE = get().unsubscribeEntries;
    const prevS = get().unsubscribeStaff;
    if (prevE) prevE();
    if (prevS) prevS();
    set({ loading: true, error: null });

    const qEntries = query(collection(db, 'kitchenEntries'), where('createdBy', '==', uid));
    const qStaff = query(collection(db, 'kitchenStaff')); // Shared master

    const unsubEntries = onSnapshot(qEntries,
      (snapshot) => {
        const entries = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as KitchenEntry[];
        entries.sort((a, b) => {
          const aTime = a.date?.seconds || 0;
          const bTime = b.date?.seconds || 0;
          return bTime - aTime;
        });
        set({ entries, loading: false });
      },
      (error) => set({ error: error.message, loading: false })
    );

    const unsubStaff = onSnapshot(qStaff,
      (snapshot) => {
        const staff = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as KitchenStaff[];
        set({ staff });
      },
      (error) => console.error(error)
    );

    set({ unsubscribeEntries: unsubEntries, unsubscribeStaff: unsubStaff });
  },

  addEntry: async (data) => {
    const docRef = await addDoc(collection(db, 'kitchenEntries'), {
      ...data, createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  updateEntry: async (id, data) => {
    await updateDoc(doc(db, 'kitchenEntries', id), { ...data });
  },

  addStaff: async (data) => {
    const docRef = await addDoc(collection(db, 'kitchenStaff'), {
      ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  updateStaff: async (id, data) => {
    await updateDoc(doc(db, 'kitchenStaff', id), { ...data, updatedAt: serverTimestamp() });
  },

  cleanup: () => {
    const { unsubscribeEntries, unsubscribeStaff } = get();
    if (unsubscribeEntries) unsubscribeEntries();
    if (unsubscribeStaff) unsubscribeStaff();
    set({ unsubscribeEntries: null, unsubscribeStaff: null, entries: [], staff: [], loading: false });
  },
}));
