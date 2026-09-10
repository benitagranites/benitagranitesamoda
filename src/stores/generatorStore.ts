// Benita Granites — Generator Store (Zustand)
import { create } from 'zustand';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, serverTimestamp, getDoc, onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { GeneratorFuelEntry } from '@/types';

interface GeneratorStore {
  entries: GeneratorFuelEntry[];
  loading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  subscribe: (uid: string) => void;
  add: (data: Omit<GeneratorFuelEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  update: (id: string, data: Partial<GeneratorFuelEntry>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Promise<GeneratorFuelEntry | null>;
  cleanup: () => void;
}

export const useGeneratorStore = create<GeneratorStore>((set, get) => ({
  entries: [],
  loading: true,
  error: null,
  unsubscribe: null,

  subscribe: (uid: string) => {
    const prev = get().unsubscribe;
    if (prev) prev();
    set({ loading: true, error: null });

    const q = query(collection(db, 'generatorEntries'), where('createdBy', '==', uid));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const entries = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as GeneratorFuelEntry[];
        entries.sort((a, b) => {
          const aTime = a.date?.seconds || 0;
          const bTime = b.date?.seconds || 0;
          return bTime - aTime;
        });
        set({ entries, loading: false });
      },
      (error) => {
        console.error('[GeneratorStore] Error:', error);
        set({ error: error.message, loading: false });
      }
    );
    set({ unsubscribe });
  },

  add: async (data) => {
    const docRef = await addDoc(collection(db, 'generatorEntries'), {
      ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  update: async (id, data) => {
    await updateDoc(doc(db, 'generatorEntries', id), { ...data, updatedAt: serverTimestamp() });
  },

  remove: async (id) => {
    await deleteDoc(doc(db, 'generatorEntries', id));
  },

  get: async (id) => {
    const docSnap = await getDoc(doc(db, 'generatorEntries', id));
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as GeneratorFuelEntry;
    return null;
  },

  cleanup: () => {
    const unsub = get().unsubscribe;
    if (unsub) unsub();
    set({ unsubscribe: null, entries: [], loading: false });
  },
}));
