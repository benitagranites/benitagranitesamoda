// Benita Granites — Dressing Store (Zustand)
import { create } from 'zustand';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs,
  query, where, serverTimestamp, getDoc, onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { DressingRecord } from '@/types';

interface DressingStore {
  records: DressingRecord[];
  loading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;

  // Actions
  subscribeToRecords: (uid: string) => void;
  addRecord: (record: Omit<DressingRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateRecord: (id: string, data: Partial<DressingRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getRecord: (id: string) => Promise<DressingRecord | null>;
  getRecordByBlockId: (blockId: string) => Promise<DressingRecord | null>;
  cleanup: () => void;
}

export const useDressingStore = create<DressingStore>((set, get) => ({
  records: [],
  loading: true,
  error: null,
  unsubscribe: null,

  subscribeToRecords: (uid: string) => {
    const prev = get().unsubscribe;
    if (prev) prev();

    set({ loading: true, error: null });

    const q = query(
      collection(db, 'dressing'),
      where('createdBy', '==', uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as DressingRecord[];
        records.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        set({ records, loading: false });
      },
      (error) => {
        console.error('[DressingStore] Subscription error:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe });
  },

  addRecord: async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'dressing'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error: unknown) {
      console.error('[DressingStore] Add error:', error);
      throw error;
    }
  },

  updateRecord: async (id, data) => {
    try {
      await updateDoc(doc(db, 'dressing', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error: unknown) {
      console.error('[DressingStore] Update error:', error);
      throw error;
    }
  },

  deleteRecord: async (id) => {
    try {
      await deleteDoc(doc(db, 'dressing', id));
    } catch (error: unknown) {
      console.error('[DressingStore] Delete error:', error);
      throw error;
    }
  },

  getRecord: async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'dressing', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DressingRecord;
      }
      return null;
    } catch {
      return null;
    }
  },

  getRecordByBlockId: async (blockId: string) => {
    try {
      const q = query(
        collection(db, 'dressing'),
        where('blockId', '==', blockId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        return { id: d.id, ...d.data() } as DressingRecord;
      }
      return null;
    } catch {
      return null;
    }
  },

  cleanup: () => {
    const unsub = get().unsubscribe;
    if (unsub) unsub();
    set({ unsubscribe: null, records: [], loading: false });
  },
}));
