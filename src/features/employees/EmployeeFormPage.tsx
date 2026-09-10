// Benita Granites — Employee Form
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const employeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required (e.g. EMP-001)'),
  name: z.string().min(1, 'Name is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  monthlySalary: z.coerce.number().min(0, 'Must be >= 0'),
  joiningDate: z.string().min(1, 'Joining date required'),
  bankDetails: z.string().optional(),
  isActive: z.boolean(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { user } = useAuthStore();
  const { addEmployee, updateEmployee, getEmployee } = useEmployeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      joiningDate: new Date().toISOString().split('T')[0],
      monthlySalary: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      getEmployee(id).then(data => {
        if (data) {
          setValue('employeeId', data.employeeId);
          setValue('name', data.name);
          setValue('department', data.department);
          setValue('designation', data.designation);
          setValue('monthlySalary', data.monthlySalary);
          setValue('bankDetails', data.bankDetails || '');
          setValue('isActive', data.isActive);
          if (data.joiningDate) {
            setValue('joiningDate', data.joiningDate.toDate().toISOString().split('T')[0]);
          }
        }
        setLoading(false);
      });
    }
  }, [isEditing, id, getEmployee, setValue]);

  const onSubmit = async (data: EmployeeFormData) => {
    if (!user?.uid) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        joiningDate: Timestamp.fromDate(new Date(data.joiningDate)),
      };

      if (isEditing && id) {
        await updateEmployee(id, payload);
        toast.success('Employee updated');
      } else {
        await addEmployee(payload as any);
        toast.success('Employee added');
      }
      navigate('/employees');
    } catch {
      toast.error('Failed to save employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/employees')} className="p-2 rounded-lg hover:bg-navy-50">
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-navy">{isEditing ? 'Edit Employee' : 'Add Employee'}</h1>
          <p className="text-sm text-text-secondary">Manage permanent staff records</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-teal" /> Personal Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Employee ID *</label>
              <input type="text" {...register('employeeId')} placeholder="e.g. EMP-001" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
              {errors.employeeId && <p className="text-xs text-critical mt-1">{errors.employeeId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Full Name *</label>
              <input type="text" {...register('name')} placeholder="Name" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
              {errors.name && <p className="text-xs text-critical mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Department *</label>
              <input type="text" {...register('department')} placeholder="e.g. Operations" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Designation *</label>
              <input type="text" {...register('designation')} placeholder="e.g. Supervisor" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Joining Date *</label>
              <input type="date" {...register('joiningDate')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <input type="checkbox" id="isActive" {...register('isActive')} className="w-5 h-5 rounded border-gray-300 text-teal focus:ring-teal" />
              <label htmlFor="isActive" className="text-sm font-medium text-navy">Active Employee</label>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Salary & Bank</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Monthly Salary (₹) *</label>
              <input type="number" step="1" {...register('monthlySalary')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm font-bold text-teal focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Bank Details (Optional)</label>
              <input type="text" {...register('bankDetails')} placeholder="A/C, IFSC..." className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/employees')} className="flex-1 py-3 bg-bg border border-border rounded-xl text-sm font-medium hover:bg-surface-hover">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-60 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Employee
          </button>
        </div>
      </form>
    </motion.div>
  );
}
