// Benita Granites — Equipment Form
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import toast from 'react-hot-toast';

const equipmentSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  internalName: z.string().min(1, 'Name is required (e.g. Excavator 1)'),
  equipmentId: z.string().min(1, 'ID is required (e.g. SANY-EX-01)'),
  registrationNumber: z.string(),
  operator: z.string().min(1, 'Operator name is required'),
  status: z.enum(['active', 'inactive', 'under_maintenance']),
  hourMeter: z.coerce.number().min(0, 'Must be >= 0'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  fuelMeasurementMethod: z.enum(['gauge', 'manual', 'meter']),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

const CATEGORIES = [
  'SANY',
  'TATA HITACHI',
  'TRACTORS',
  'GENERATORS',
  'SITE VEHICLES',
  'MANAGEMENT VEHICLES',
];

export default function EquipmentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { user } = useAuthStore();
  const { add, update, get, remove } = useEquipmentStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      category: 'SANY',
      status: 'active',
      fuelType: 'diesel',
      fuelMeasurementMethod: 'gauge',
      hourMeter: 0,
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      get(id).then((data) => {
        if (data) {
          Object.keys(data).forEach(key => {
            if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
              setValue(key as keyof EquipmentFormData, data[key as keyof typeof data] as any);
            }
          });
        }
        setLoading(false);
      });
    }
  }, [isEditing, id, get, setValue]);

  const onSubmit = async (data: EquipmentFormData) => {
    if (!user?.uid) return;
    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        await update(id, data);
        toast.success('Equipment updated');
      } else {
        await add({ ...data, isActive: true, ownerId: user.uid } as any);
        toast.success('Equipment added');
      }
      navigate('/equipment');
    } catch {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      await remove(id);
      toast.success('Deleted successfully');
      navigate('/equipment');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/equipment')} className="p-2 rounded-lg hover:bg-navy-50">
            <ArrowLeft className="w-5 h-5 text-navy" />
          </button>
          <h1 className="text-xl font-bold text-navy">{isEditing ? 'Edit Equipment' : 'Add Equipment'}</h1>
        </div>
        {isEditing && (
          <button onClick={handleDelete} className="p-2 text-critical hover:bg-critical-bg rounded-lg">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">Category *</label>
            <select {...register('category')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-critical mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Internal Name *</label>
            <input {...register('internalName')} placeholder="e.g. Excavator 1" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            {errors.internalName && <p className="text-xs text-critical mt-1">{errors.internalName.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Equipment ID *</label>
            <input {...register('equipmentId')} placeholder="e.g. SANY-EX-01" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            {errors.equipmentId && <p className="text-xs text-critical mt-1">{errors.equipmentId.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Operator / Driver *</label>
            <input {...register('operator')} placeholder="Operator name" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            {errors.operator && <p className="text-xs text-critical mt-1">{errors.operator.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Current Hour Meter</label>
            <input type="number" step="1" {...register('hourMeter')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Fuel Type</label>
            <select {...register('fuelType')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal">
              <option value="diesel">Diesel</option>
              <option value="petrol">Petrol</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
            <select {...register('status')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal">
              <option value="active">Active</option>
              <option value="under_maintenance">Under Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">Registration Number (Optional)</label>
            <input {...register('registrationNumber')} placeholder="e.g. AP 39 XX 1234" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/equipment')} className="flex-1 py-3 bg-bg border border-border rounded-xl text-sm font-medium hover:bg-surface-hover">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-60 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
