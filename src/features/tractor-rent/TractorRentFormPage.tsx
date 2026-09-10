// Benita Granites — Tractor Rent Form
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save, Tractor } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTractorRentStore } from '@/stores/tractorRentStore';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const tractorSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  tractorId: z.string().min(1, 'Tractor ID required (e.g. Tractor-05)'),
  owner: z.string().min(1, 'Owner name required'),
  workPerformed: z.string().min(1, 'Work type required (e.g. Drilling)'),
  hours: z.coerce.number().min(0),
  holesdrilled: z.coerce.number().min(0),
  rate: z.coerce.number().min(0),
  paymentStatus: z.enum(['pending', 'paid']),
});

type TractorFormData = z.infer<typeof tractorSchema>;

export default function TractorRentFormPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { add } = useTractorRentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<TractorFormData>({
    resolver: zodResolver(tractorSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      workPerformed: 'Drilling',
      hours: 0,
      holesdrilled: 0,
      rate: 350,
      paymentStatus: 'pending',
    },
  });

  const holes = watch('holesdrilled') || 0;
  const rate = watch('rate') || 0;
  const workPerformed = watch('workPerformed');
  const hours = watch('hours') || 0;

  // Amount is either based on holes (if drilling) or hours (if hourly rate)
  const isDrilling = workPerformed.toLowerCase().includes('drill');
  const amount = isDrilling ? holes * rate : hours * rate;
  const costPerHole = holes > 0 ? amount / holes : 0;

  const onSubmit = async (data: TractorFormData) => {
    if (!user?.uid) return;
    setIsSubmitting(true);
    try {
      await add({
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        amount,
        costPerHole,
        approvedBy: null,
        createdBy: user.uid,
      });
      toast.success('Rental record added');
      navigate('/tractor-rent');
    } catch {
      toast.error('Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/tractor-rent')} className="p-2 rounded-lg hover:bg-navy-50">
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-navy">Add Tractor Rental</h1>
          <p className="text-sm text-text-secondary">Log external equipment rent and drilling work</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Tractor className="w-4 h-4 text-teal" /> Rental Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Date *</label>
              <input type="date" {...register('date')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Tractor ID *</label>
              <input type="text" {...register('tractorId')} placeholder="e.g. Tractor-05" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
              {errors.tractorId && <p className="text-xs text-critical mt-1">{errors.tractorId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Owner Name *</label>
              <input type="text" {...register('owner')} placeholder="Owner Name" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
              {errors.owner && <p className="text-xs text-critical mt-1">{errors.owner.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Payment Status</label>
              <select {...register('paymentStatus')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Work Performed</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1">Type of Work *</label>
              <input type="text" {...register('workPerformed')} placeholder="e.g. Drilling, Hauling" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Hours Worked</label>
              <input type="number" step="0.5" {...register('hours')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            
            {isDrilling && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Number of Holes Drilled</label>
                <input type="number" step="1" {...register('holesdrilled')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal font-semibold text-navy" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Rates & Cost</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Rate (₹) {isDrilling ? 'per Hole' : 'per Hour'} *
              </label>
              <input type="number" step="1" {...register('rate')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div className="bg-navy-50 border border-navy-200 rounded-xl p-3 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-medium text-navy-600 mb-0.5">Amount Payable</span>
              <span className="text-xl font-bold text-navy">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            {isDrilling && (
              <div className="col-span-2 mt-2">
                <p className="text-xs text-center text-teal-800 bg-teal-50 py-2 rounded-lg border border-teal-200 font-medium">
                  KPI: Cost per hole is <span className="font-bold">₹{costPerHole.toLocaleString('en-IN')}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/tractor-rent')} className="flex-1 py-3 bg-bg border border-border rounded-xl text-sm font-medium hover:bg-surface-hover">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-60 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Record
          </button>
        </div>
      </form>
    </motion.div>
  );
}
