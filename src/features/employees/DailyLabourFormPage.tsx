// Benita Granites — Daily Labour Form
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save, Users } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const labourSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  department: z.string().min(1, 'Department is required'),
  work: z.string().min(1, 'Work description is required'),
  persons: z.coerce.number().min(1, 'Must have at least 1 person'),
  rate: z.coerce.number().min(1, 'Rate is required'),
});

type LabourFormData = z.infer<typeof labourSchema>;

const CATEGORIES = ['Drilling', 'Loading', 'Dressing', 'General', 'Other'];

export default function DailyLabourFormPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addDailyLabour } = useEmployeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LabourFormData>({
    resolver: zodResolver(labourSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      department: 'Quarry Operations',
      category: 'General',
      persons: 1,
      rate: 700,
    },
  });

  const persons = watch('persons') || 0;
  const rate = watch('rate') || 0;
  const amount = persons * rate;

  const onSubmit = async (data: LabourFormData) => {
    if (!user?.uid) return;
    setIsSubmitting(true);
    try {
      await addDailyLabour({
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        amount,
        approvalStatus: 'pending',
        createdBy: user.uid,
      });
      toast.success('Daily labour entry saved');
      navigate('/labour');
    } catch {
      toast.error('Failed to save entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/labour')} className="p-2 rounded-lg hover:bg-navy-50">
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-navy">Log Daily Labour</h1>
          <p className="text-sm text-text-secondary">Add wage workers for the day</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal" /> Labour Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Date *</label>
              <input type="date" {...register('date')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category *</label>
              <select {...register('category')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Department</label>
              <input type="text" {...register('department')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Specific Work Performed *</label>
              <input type="text" {...register('work')} placeholder="e.g. Loading waste material" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
              {errors.work && <p className="text-xs text-critical mt-1">{errors.work.message}</p>}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Wages</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Persons *</label>
              <input type="number" step="1" {...register('persons')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal font-semibold text-navy" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Daily Rate (₹) *</label>
              <input type="number" step="1" {...register('rate')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div className="col-span-2 sm:col-span-1 bg-navy-50 border border-navy-200 rounded-xl p-3 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-medium text-navy-600 mb-0.5">Total Amount</span>
              <span className="text-xl font-bold text-navy">₹{amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/labour')} className="flex-1 py-3 bg-bg border border-border rounded-xl text-sm font-medium hover:bg-surface-hover">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-60 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Entry
          </button>
        </div>
      </form>
    </motion.div>
  );
}
