// Benita Granites — Equipment Store (Zustand)
import { create } from 'zustand';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, serverTimestamp, getDoc, onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Equipment } from '@/types';

interface EquipmentStore {
  equipment: Equipment[];
  loading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  subscribe: (uid: string) => void;
  add: (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  update: (id: string, data: Partial<Equipment>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Promise<Equipment | null>;
  cleanup: () => void;
}

export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
  equipment: [],
  loading: true,
  error: null,
  unsubscribe: null,

  subscribe: (uid: string) => {
    const prev = get().unsubscribe;
    if (prev) prev();
    set({ loading: true, error: null });

    const q = query(collection(db, 'equipment'), where('ownerId', '==', uid));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const equipment = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Equipment[];
        equipment.sort((a, b) => {
          if (a.category !== b.category) return a.category.localeCompare(b.category);
          return a.internalName.localeCompare(b.internalName);
        });
        set({ equipment, loading: false });
      },
      (error) => {
        console.error('[EquipmentStore] Error:', error);
        set({ error: error.message, loading: false });
      }
    );
    set({ unsubscribe });
  },

  add: async (data) => {
    const docRef = await addDoc(collection(db, 'equipment'), {
      ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  update: async (id, data) => {
    await updateDoc(doc(db, 'equipment', id), { ...data, updatedAt: serverTimestamp() });
  },

  remove: async (id) => {
    await deleteDoc(doc(db, 'equipment', id));
  },

  get: async (id) => {
    const docSnap = await getDoc(doc(db, 'equipment', id));
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as Equipment;
    return null;
  },

  cleanup: () => {
    const unsub = get().unsubscribe;
    if (unsub) unsub();
    set({ unsubscribe: null, equipment: [], loading: false });
  },
}));
