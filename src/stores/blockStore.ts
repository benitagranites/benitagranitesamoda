// Benita Granites — Block Production Zustand Store
import { create } from 'zustand';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs,
  query, orderBy, where, serverTimestamp, getDoc,
  onSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Block } from '@/types';
import type { BlockCategory, BlockStatus } from '@/constants';

interface BlockFilters {
  category: BlockCategory | 'all';
  status: BlockStatus | 'all';
  search: string;
}

interface BlockStore {
  blocks: Block[];
  loading: boolean;
  error: string | null;
  filters: BlockFilters;
  unsubscribe: Unsubscribe | null;

  // Actions
  subscribeToBlocks: (uid: string) => void;
  addBlock: (block: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBlock: (id: string, data: Partial<Block>) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  getBlock: (id: string) => Promise<Block | null>;
  getNextBlockNumber: (uid: string) => Promise<string>;
  setFilters: (filters: Partial<BlockFilters>) => void;
  cleanup: () => void;
}

export const useBlockStore = create<BlockStore>((set, get) => ({
  blocks: [],
  loading: true,
  error: null,
  filters: { category: 'all', status: 'all', search: '' },
  unsubscribe: null,

  subscribeToBlocks: (uid: string) => {
    // Clean up previous subscription
    const prev = get().unsubscribe;
    if (prev) prev();

    set({ loading: true, error: null });

    const q = query(
      collection(db, 'blocks'),
      where('ownerId', '==', uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const blocks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Block[];
        // Sort client-side (newest first) to avoid composite index requirement
        blocks.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        set({ blocks, loading: false });
      },
      (error) => {
        console.error('[BlockStore] Subscription error:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribe });
  },

  addBlock: async (blockData) => {
    try {
      const docRef = await addDoc(collection(db, 'blocks'), {
        ...blockData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('[BlockStore] Add error:', err);
      throw error;
    }
  },

  updateBlock: async (id, data) => {
    try {
      await updateDoc(doc(db, 'blocks', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error: unknown) {
      console.error('[BlockStore] Update error:', error);
      throw error;
    }
  },

  deleteBlock: async (id) => {
    try {
      await deleteDoc(doc(db, 'blocks', id));
    } catch (error: unknown) {
      console.error('[BlockStore] Delete error:', error);
      throw error;
    }
  },

  getBlock: async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'blocks', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Block;
      }
      return null;
    } catch (error: unknown) {
      console.error('[BlockStore] Get error:', error);
      return null;
    }
  },

  getNextBlockNumber: async (uid: string) => {
    try {
      const q = query(
        collection(db, 'blocks'),
        where('ownerId', '==', uid)
      );
      const snapshot = await getDocs(q);
      const nextNum = snapshot.size + 1;
      return `BG-${String(nextNum).padStart(5, '0')}`;
    } catch {
      return `BG-00001`;
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  cleanup: () => {
    const unsub = get().unsubscribe;
    if (unsub) unsub();
    set({ unsubscribe: null, blocks: [], loading: false });
  },
}));
