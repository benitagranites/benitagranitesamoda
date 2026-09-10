// Benita Granites — Employee Store (Zustand)
import { create } from 'zustand';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, serverTimestamp, getDoc, onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Employee, DailyLabour } from '@/types';

interface EmployeeStore {
  employees: Employee[];
  dailyLabour: DailyLabour[];
  loading: boolean;
  error: string | null;
  unsubscribeEmp: Unsubscribe | null;
  unsubscribeLab: Unsubscribe | null;

  subscribe: (uid: string) => void;
  addEmployee: (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
  getEmployee: (id: string) => Promise<Employee | null>;

  addDailyLabour: (data: Omit<DailyLabour, 'id' | 'createdAt'>) => Promise<string>;
  removeDailyLabour: (id: string) => Promise<void>;
  
  cleanup: () => void;
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
  employees: [],
  dailyLabour: [],
  loading: true,
  error: null,
  unsubscribeEmp: null,
  unsubscribeLab: null,

  subscribe: (uid: string) => {
    const prevEmp = get().unsubscribeEmp;
    const prevLab = get().unsubscribeLab;
    if (prevEmp) prevEmp();
    if (prevLab) prevLab();
    
    set({ loading: true, error: null });

    // Employees
    const qEmp = query(collection(db, 'employees')); // Often shared, but could filter by owner if needed.
    const unsubEmp = onSnapshot(qEmp,
      (snapshot) => {
        const employees = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Employee[];
        employees.sort((a, b) => a.name.localeCompare(b.name));
        set({ employees });
      },
      (error) => {
        console.error('[EmployeeStore] Error:', error);
        set({ error: error.message });
      }
    );

    // Daily Labour
    const qLab = query(collection(db, 'dailyLabour'), where('createdBy', '==', uid));
    const unsubLab = onSnapshot(qLab,
      (snapshot) => {
        const dailyLabour = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as DailyLabour[];
        dailyLabour.sort((a, b) => {
          const aTime = a.date?.seconds || 0;
          const bTime = b.date?.seconds || 0;
          return bTime - aTime;
        });
        set({ dailyLabour, loading: false });
      },
      (error) => {
        console.error('[EmployeeStore - Labour] Error:', error);
        set({ error: error.message, loading: false });
      }
    );

    set({ unsubscribeEmp: unsubEmp, unsubscribeLab: unsubLab });
  },

  addEmployee: async (data) => {
    const docRef = await addDoc(collection(db, 'employees'), {
      ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  updateEmployee: async (id, data) => {
    await updateDoc(doc(db, 'employees', id), { ...data, updatedAt: serverTimestamp() });
  },

  removeEmployee: async (id) => {
    await deleteDoc(doc(db, 'employees', id));
  },

  getEmployee: async (id) => {
    const docSnap = await getDoc(doc(db, 'employees', id));
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as Employee;
    return null;
  },

  addDailyLabour: async (data) => {
    const docRef = await addDoc(collection(db, 'dailyLabour'), {
      ...data, createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  removeDailyLabour: async (id) => {
    await deleteDoc(doc(db, 'dailyLabour', id));
  },

  cleanup: () => {
    const { unsubscribeEmp, unsubscribeLab } = get();
    if (unsubscribeEmp) unsubscribeEmp();
    if (unsubscribeLab) unsubscribeLab();
    set({ unsubscribeEmp: null, unsubscribeLab: null, employees: [], dailyLabour: [], loading: false });
  },
}));
