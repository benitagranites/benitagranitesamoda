// Benita Granites — Fuel Entry Form
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save, Calculator, Truck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useFuelStore } from '@/stores/fuelStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const fuelSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  equipmentId: z.string().min(1, 'Select a vehicle'),
  openingHour: z.coerce.number().min(0),
  closingHour: z.coerce.number().min(0),
  dieselFilled: z.coerce.number().min(1, 'Must enter diesel amount'),
  ratePerLitre: z.coerce.number().min(1, 'Must enter rate'),
  operator: z.string().min(1, 'Operator name required'),
  location: z.string().min(1, 'Location required'),
});

type FuelFormData = z.infer<typeof fuelSchema>;

export default function FuelFormPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { add } = useFuelStore();
  const { equipment, subscribe, update: updateEquipment } = useEquipmentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FuelFormData>({
    resolver: zodResolver(fuelSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      location: 'Quarry Site',
      openingHour: 0,
      closingHour: 0,
      dieselFilled: 0,
      ratePerLitre: 106,
    },
  });

  const selectedEqId = watch('equipmentId');
  const openingHour = watch('openingHour');
  const closingHour = watch('closingHour');
  const dieselFilled = watch('dieselFilled');
  const ratePerLitre = watch('ratePerLitre');

  const selectedEq = equipment.find(e => e.id === selectedEqId);
  
  // Auto calculations
  const hoursUsed = Math.max(0, closingHour - openingHour);
  const totalCost = dieselFilled * ratePerLitre;
  const efficiency = hoursUsed > 0 ? dieselFilled / hoursUsed : 0;

  useEffect(() => {
    if (user?.uid) subscribe(user.uid);
  }, [user?.uid]);

  // Auto-fill operator and opening hour when vehicle changes
  useEffect(() => {
    if (selectedEq) {
      setValue('operator', selectedEq.operator || '');
      setValue('openingHour', selectedEq.hourMeter || 0);
      setValue('closingHour', selectedEq.hourMeter || 0);
    }
  }, [selectedEq, setValue]);

  const onSubmit = async (data: FuelFormData) => {
    if (!user?.uid) return;
    if (data.closingHour < data.openingHour) {
      toast.error('Closing hour cannot be less than opening hour');
      return;
    }

    setIsSubmitting(true);
    try {
      await add({
        date: Timestamp.fromDate(new Date(data.date)),
        equipmentId: data.equipmentId,
        openingHour: data.openingHour,
        closingHour: data.closingHour,
        hoursUsed,
        dieselFilled: data.dieselFilled,
        ratePerLitre: data.ratePerLitre,
        totalCost,
        efficiency,
        operator: data.operator,
        location: data.location,
        createdBy: user.uid,
      });

      // Update the equipment's master hour meter
      await updateEquipment(data.equipmentId, { hourMeter: data.closingHour });

      toast.success('Fuel entry saved');
      navigate('/fuel');
    } catch {
      toast.error('Failed to save fuel entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/fuel')} className="p-2 rounded-lg hover:bg-navy-50">
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-navy">Daily Fuel Entry</h1>
          <p className="text-sm text-text-secondary">Log diesel consumption and calculate efficiency</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-teal" /> Vehicle Selection
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Date *</label>
              <input type="date" {...register('date')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Vehicle *</label>
              <select {...register('equipmentId')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal">
                <option value="">Select Vehicle...</option>
                {equipment.map(e => (
                  <option key={e.id} value={e.id}>{e.internalName} ({e.equipmentId})</option>
                ))}
              </select>
              {errors.equipmentId && <p className="text-xs text-critical mt-1">{errors.equipmentId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Operator / Driver *</label>
              <input type="text" {...register('operator')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Location *</label>
              <input type="text" {...register('location')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Hour Meter Readings</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Opening Hour *</label>
              <input type="number" step="1" {...register('openingHour')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Closing Hour *</label>
              <input type="number" step="1" {...register('closingHour')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-medium text-slate-500 mb-0.5">Hours Used</span>
              <span className="text-xl font-bold text-slate-800">{hoursUsed.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Fuel & Cost</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-text-secondary mb-1">Diesel (Litres) *</label>
              <input type="number" step="1" {...register('dieselFilled')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal font-semibold text-teal" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-text-secondary mb-1">Rate (₹/L) *</label>
              <input type="number" step="0.1" {...register('ratePerLitre')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            
            {/* Auto Calculations */}
            <div className="bg-navy-50 border border-navy-200 rounded-xl p-3 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-medium text-navy-600 mb-0.5">Total Cost</span>
              <span className="text-lg font-bold text-navy">₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-info-bg border border-info-border rounded-xl p-3 flex flex-col justify-center items-center text-center">
              <span className="text-xs font-medium text-info mb-0.5">Efficiency</span>
              <span className="text-lg font-bold text-info">{efficiency.toFixed(1)} L/Hr</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/fuel')} className="flex-1 py-3 bg-bg border border-border rounded-xl text-sm font-medium hover:bg-surface-hover">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-60 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Fuel Entry
          </button>
        </div>
      </form>
    </motion.div>
  );
}
