// Benita Granites — Purchase Form
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save, Receipt, Upload, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { Timestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '@/cloudinary/upload';
import toast from 'react-hot-toast';

const purchaseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  invoiceNumber: z.string().min(1, 'Invoice # is required'),
  category: z.string().min(1, 'Category is required'),
  item: z.string().min(1, 'Item name is required'),
  quantity: z.coerce.number().min(0.01, 'Qty > 0'),
  unit: z.string().min(1, 'Unit required (e.g. kg, L, nos)'),
  rate: z.coerce.number().min(0, 'Rate required'),
  gst: z.coerce.number().min(0, 'GST % required'),
  paymentMode: z.enum(['cash', 'bank', 'upi']),
  paymentStatus: z.enum(['pending', 'paid']),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

const CATEGORIES = ['Fuel', 'Machinery', 'Mine Operations', 'Office', 'Kitchen', 'Other'];

export default function PurchaseFormPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { add } = usePurchaseStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: 'Mine Operations',
      quantity: 1,
      unit: 'nos',
      rate: 0,
      gst: 0,
      paymentMode: 'bank',
      paymentStatus: 'pending',
    },
  });

  const qty = watch('quantity') || 0;
  const rate = watch('rate') || 0;
  const gst = watch('gst') || 0;
  
  const subTotal = qty * rate;
  const gstAmount = subTotal * (gst / 100);
  const totalAmount = subTotal + gstAmount;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be < 5MB');
        return;
      }
      setBillFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBillPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PurchaseFormData) => {
    if (!user?.uid) return;
    setIsSubmitting(true);
    
    try {
      let billPhoto = '';
      if (billFile) {
        toast.loading('Uploading bill photo...', { id: 'upload' });
        const res = await uploadToCloudinary(billFile, 'purchases');
        billPhoto = res.secure_url;
        toast.success('Bill uploaded', { id: 'upload' });
      }

      await add({
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        total: totalAmount,
        billPhoto,
        approvalStatus: 'pending',
        createdBy: user.uid,
      });

      toast.success('Purchase logged successfully');
      navigate('/purchases');
    } catch (err) {
      console.error(err);
      toast.error('Failed to log purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/purchases')} className="p-2 rounded-lg hover:bg-navy-50">
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-navy">Add Purchase Entry</h1>
          <p className="text-sm text-text-secondary">Log expenses for site, machinery, and kitchen</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-5">
            <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal" /> Invoice Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Date *</label>
                  <input type="date" {...register('date')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Invoice Number *</label>
                  <input type="text" {...register('invoiceNumber')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
                  {errors.invoiceNumber && <p className="text-xs text-critical mt-1">{errors.invoiceNumber.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-text-secondary mb-1">Supplier Name *</label>
                  <input type="text" {...register('supplier')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
                  {errors.supplier && <p className="text-xs text-critical mt-1">{errors.supplier.message}</p>}
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Item Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-text-secondary mb-1">Category *</label>
                  <select {...register('category')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-text-secondary mb-1">Item Description *</label>
                  <input type="text" {...register('item')} placeholder="e.g. Engine Oil 15W40" className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
                  {errors.item && <p className="text-xs text-critical mt-1">{errors.item.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Quantity *</label>
                  <input type="number" step="0.01" {...register('quantity')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Unit *</label>
                  <input type="text" {...register('unit')} placeholder="nos, kg, L..." className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Rate (₹) *</label>
                  <input type="number" step="0.01" {...register('rate')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">GST (%) *</label>
                  <input type="number" step="0.01" {...register('gst')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal" />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Payment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
                  <select {...register('paymentStatus')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Mode</label>
                  <select {...register('paymentMode')} className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal">
                    <option value="bank">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-navy-50 rounded-xl border border-navy-200 p-5 sticky top-20">
              <h3 className="text-sm font-bold text-navy-800 mb-4 uppercase tracking-wider">Summary</h3>
              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between text-navy-700">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-navy-700">
                  <span>GST ({gst}%)</span>
                  <span className="font-medium">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-3 border-t border-navy-200 flex justify-between text-navy items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-black">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-xs font-bold text-navy-800 mb-2 uppercase tracking-wider">Attach Bill</label>
                {billPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-navy-200 bg-white">
                    <img src={billPreview} alt="Bill Preview" className="w-full h-32 object-cover" />
                    <button type="button" onClick={() => { setBillFile(null); setBillPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-navy-300 rounded-xl bg-white/50 cursor-pointer hover:bg-white transition-colors group">
                    <Upload className="w-6 h-6 text-navy-400 group-hover:text-navy mb-2" />
                    <span className="text-xs font-medium text-navy-600">Click to upload photo</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full mt-6 py-3.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-60 flex items-center justify-center gap-2 transition-all shadow-md">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Purchase
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
