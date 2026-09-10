// Benita Granites — Generator Form
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save, Zap } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useGeneratorStore } from '@/stores/generatorStore';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const generatorSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  generatorId: z.string().min(1, 'Generator ID is required'),
  openingHour: z.coerce.number().min(0),
  closingHour: z.coerce.number().min(0),
  dieselLitres: z.coerce.number().min(0),
  dieselRate: z.coerce.number().min(0),
  load: z.string().optional(),
  operator: z.string().min(1, 'Operator name is required'),
  remarks: z.string().optional(),
});

type GeneratorFormData = z.infer<typeof generatorSchema>;

export default function GeneratorFormPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { add } = useGeneratorStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<GeneratorFormData>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      openingHour: 0,
      closingHour: 0,
      dieselLitres: 0,
      dieselRate: 106,
    },
  });

  const openingHour = watch('openingHour');
  const closingHour = watch('closingHour');
  const dieselLitres = watch('dieselLitres');
  const dieselRate = watch('dieselRate');

  const runningHours = Math.max(0, closingHour - openingHour);
  const dieselCost = dieselLitres * dieselRate;

  const onSubmit = async (data: GeneratorFormData) => {
    if (!user?.uid) return;
    if (data.closingHour < data.openingHour) {
      toast.error('Closing hour must be >= opening hour');
      return;
    }

    setIsSubmitting(true);
    try {
      await add({
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        runningHours,
        dieselCost,
        createdBy: user.uid,
      });
      toast.success('Generator record added');
      navigate('/generators');
    } catch {
      toast.error('Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/generators')} className="p-2 rounded-lg hover:bg-navy-50">
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-navy">New Generator Log</h1>
          <p className="text-sm text-text-secondary">Log DG fuel and running hours</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal" /> Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Date *</label>
              <input type="date" {...register('date')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Generator ID *</label>
              <input type="text" {...register('generatorId')} placeholder="e.g. DG-02" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
              {errors.generatorId && <p className="text-xs text-critical mt-1">{errors.generatorId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Operator *</label>
              <input type="text" {...register('operator')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
              {errors.operator && <p className="text-xs text-critical mt-1">{errors.operator.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Load Info (Optional)</label>
              <input type="text" {...register('load')} placeholder="e.g. Full load, Wire saw..." className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Hours</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Opening Hour</label>
              <input type="number" step="0.1" {...register('openingHour')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Closing Hour</label>
              <input type="number" step="0.1" {...register('closingHour')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div className="col-span-2 sm:col-span-1 bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-medium text-amber-700 mb-0.5">Running Hours</span>
              <span className="text-xl font-bold text-amber-600">{runningHours.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Fuel</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Diesel (Litres)</label>
              <input type="number" step="0.1" {...register('dieselLitres')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal font-semibold text-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Rate (₹/L)</label>
              <input type="number" step="0.1" {...register('dieselRate')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div className="col-span-2 sm:col-span-1 bg-navy-50 border border-navy-200 rounded-xl p-3 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-medium text-navy-600 mb-0.5">Total Cost</span>
              <span className="text-xl font-bold text-navy">₹{dieselCost.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <label className="block text-xs font-medium text-text-secondary mb-1">Remarks</label>
          <textarea {...register('remarks')} rows={2} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal resize-none" />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/generators')} className="flex-1 py-3 bg-bg border border-border rounded-xl text-sm font-medium hover:bg-surface-hover">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-60 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Log
          </button>
        </div>
      </form>
    </motion.div>
  );
}
