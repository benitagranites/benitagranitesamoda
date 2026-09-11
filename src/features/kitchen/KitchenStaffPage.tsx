// Benita Granites — Kitchen Staff Page
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { useKitchenStore } from '@/stores/kitchenStore';
import type { KitchenStaff } from '@/types';
import toast from 'react-hot-toast';

export default function KitchenStaffPage() {
  const navigate = useNavigate();
  const { staff, loading, subscribe, cleanup, addStaff, updateStaff } = useKitchenStore();
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<KitchenStaff>>({});

  useEffect(() => {
    // Shared master, uid not strictly required for read
    subscribe('global');
    return () => cleanup();
  }, []);

  const handleEdit = (s: KitchenStaff) => {
    setIsEditing(s.id);
    setFormData({ name: s.name, role: s.role, monthlySalary: s.monthlySalary, isActive: s.isActive });
  };

  const handleNew = () => {
    setIsEditing('new');
    setFormData({ name: '', role: 'head_cook', monthlySalary: 0, isActive: true });
  };

  const handleSave = async () => {
    if (!formData.name || formData.monthlySalary === undefined) {
      toast.error('Name and Salary required');
      return;
    }
    
    try {
      if (isEditing === 'new') {
        await addStaff(formData as any);
        toast.success('Staff added');
      } else if (isEditing) {
        await updateStaff(isEditing, formData);
        toast.success('Staff updated');
      }
      setIsEditing(null);
    } catch {
      toast.error('Failed to save');
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/kitchen')} className="p-2 rounded-lg hover:bg-navy-50">
            <ArrowLeft className="w-5 h-5 text-navy" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-navy">Kitchen Staff</h1>
            <p className="text-sm text-text-secondary">Manage cooks and salaries</p>
          </div>
        </div>
        {!isEditing && (
          <button onClick={handleNew} className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-sm">
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg border-b border-border text-xs text-text-secondary font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Monthly Salary</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  {isEditing === s.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-2 py-1 border rounded" />
                      </td>
                      <td className="px-4 py-2">
                        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })} className="w-full px-2 py-1 border rounded">
                          <option value="head_cook">Head Cook</option>
                          <option value="assistant_cook">Asst Cook</option>
                          <option value="helper">Helper</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" value={formData.monthlySalary} onChange={e => setFormData({ ...formData, monthlySalary: Number(e.target.value) })} className="w-full px-2 py-1 border rounded" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={handleSave} className="text-teal font-medium hover:underline mr-3">Save</button>
                        <button onClick={() => setIsEditing(null)} className="text-text-secondary hover:underline">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-semibold text-navy">{s.name}</td>
                      <td className="px-4 py-3 capitalize">{s.role.replace('_', ' ')}</td>
                      <td className="px-4 py-3 font-bold text-navy">{formatINR(s.monthlySalary)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-medium border', 
                          s.isActive ? 'bg-success-bg text-success border-success-border' : 'bg-gray-100 text-gray-500 border-gray-200'
                        )}>
                          {s.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleEdit(s)} className="text-slate-blue font-medium hover:underline">Edit</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {isEditing === 'new' && (
                <tr className="bg-teal-50">
                  <td className="px-4 py-2">
                    <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-2 py-1.5 border border-teal-200 rounded outline-teal" />
                  </td>
                  <td className="px-4 py-2">
                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })} className="w-full px-2 py-1.5 border border-teal-200 rounded outline-teal">
                      <option value="head_cook">Head Cook</option>
                      <option value="assistant_cook">Asst Cook</option>
                      <option value="helper">Helper</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" placeholder="Salary" value={formData.monthlySalary || ''} onChange={e => setFormData({ ...formData, monthlySalary: Number(e.target.value) })} className="w-full px-2 py-1.5 border border-teal-200 rounded outline-teal" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-teal" />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={handleSave} className="text-teal font-bold hover:underline mr-3">Save</button>
                    <button onClick={() => setIsEditing(null)} className="text-text-secondary hover:underline">Cancel</button>
                  </td>
                </tr>
              )}

              {staff.length === 0 && isEditing !== 'new' && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                    No kitchen staff added.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
