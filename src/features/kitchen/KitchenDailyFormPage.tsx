// Benita Granites — Kitchen Daily Form
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useKitchenStore } from '@/stores/kitchenStore';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const mealSchema = z.object({
  served: z.coerce.number().min(0),
  teaCost: z.coerce.number().min(0).optional(),
  snacksCost: z.coerce.number().min(0).optional(),
  foodCost: z.coerce.number().min(0).optional(),
});

const kitchenSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  breakfast: mealSchema,
  lunch: mealSchema,
  eveningTea: mealSchema,
  dinner: mealSchema,
});

type KitchenFormData = z.infer<typeof kitchenSchema>;

export default function KitchenDailyFormPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addEntry } = useKitchenStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch } = useForm<KitchenFormData>({
    resolver: zodResolver(kitchenSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      breakfast: { served: 0, teaCost: 0, foodCost: 0 },
      lunch: { served: 0, foodCost: 0 },
      eveningTea: { served: 0, snacksCost: 0 },
      dinner: { served: 0, foodCost: 0 },
    },
  });

  const b = watch('breakfast');
  const l = watch('lunch');
  const e = watch('eveningTea');
  const d = watch('dinner');

  const totalCost = 
    (b?.teaCost || 0) + (b?.foodCost || 0) + 
    (l?.foodCost || 0) + 
    (e?.snacksCost || 0) + 
    (d?.foodCost || 0);

  const onSubmit = async (data: KitchenFormData) => {
    if (!user?.uid) return;
    setIsSubmitting(true);
    try {
      await addEntry({
        date: Timestamp.fromDate(new Date(data.date)),
        breakfast: { served: data.breakfast.served, teaCost: data.breakfast.teaCost || 0, foodCost: data.breakfast.foodCost || 0 },
        lunch: { served: data.lunch.served, foodCost: data.lunch.foodCost || 0 },
        eveningTea: { served: data.eveningTea.served, snacksCost: data.eveningTea.snacksCost || 0 },
        dinner: { served: data.dinner.served, foodCost: data.dinner.foodCost || 0 },
        totalCost,
        costPerEmployee: 0, // Handled globally in KPI dashboard
        createdBy: user.uid,
      });
      toast.success('Kitchen entry saved');
      navigate('/kitchen');
    } catch {
      toast.error('Failed to save entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/kitchen')} className="p-2 rounded-lg hover:bg-navy-50">
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-navy">Log Daily Meals</h1>
          <p className="text-sm text-text-secondary">Track employees served and daily food cost</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <label className="block text-xs font-medium text-text-secondary mb-1">Date *</label>
          <input type="date" {...register('date')} className="w-full sm:w-1/3 px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Breakfast */}
          <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Breakfast</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Employees Served</label>
                <input type="number" {...register('breakfast.served')} className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-secondary mb-1">Tea Cost (₹)</label>
                  <input type="number" {...register('breakfast.teaCost')} className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-secondary mb-1">Food Cost (₹)</label>
                  <input type="number" {...register('breakfast.foodCost')} className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Lunch */}
          <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Lunch</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Employees Served</label>
                <input type="number" {...register('lunch.served')} className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Food Cost (₹)</label>
                <input type="number" {...register('lunch.foodCost')} className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Evening Tea */}
          <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Evening Tea</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Employees Served</label>
                <input type="number" {...register('eveningTea.served')} className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Tea / Snacks Cost (₹)</label>
                <input type="number" {...register('eveningTea.snacksCost')} className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Dinner */}
          <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Dinner</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Employees Served</label>
                <input type="number" {...register('dinner.served')} className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Food Cost (₹)</label>
                <input type="number" {...register('dinner.foodCost')} className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-navy-50 rounded-xl border border-navy-200 p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">Total Daily Cost</h3>
            <p className="text-xs text-navy-600 mt-0.5">Sum of all meals and tea</p>
          </div>
          <p className="text-2xl font-black text-navy">₹{totalCost.toLocaleString('en-IN')}</p>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/kitchen')} className="flex-1 py-3 bg-bg border border-border rounded-xl text-sm font-medium hover:bg-surface-hover">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-60 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Entry
          </button>
        </div>
      </form>
    </motion.div>
  );
}
