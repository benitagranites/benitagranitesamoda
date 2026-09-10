// Benita Granites — Dressing Form (Add / Edit)
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save, Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useDressingStore } from '@/stores/dressingStore';
import { useBlockStore } from '@/stores/blockStore';
import { BLOCK_CATEGORY_LABELS, BLOCK_STATUS } from '@/constants';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const dressingSchema = z.object({
  blockId: z.string().min(1, 'Select a block'),
  startDate: z.string().min(1, 'Start date is required'),
  completionDate: z.string().optional(),
  dressingType: z.enum(['normal', 'buyer_specific']),
  buyer: z.string().optional(),
  reqLength: z.coerce.number().optional(),
  reqWidth: z.coerce.number().optional(),
  reqHeight: z.coerce.number().optional(),
  specialRequirements: z.string().optional(),
  dressingCost: z.coerce.number().min(0),
  labourCost: z.coerce.number().min(0),
  equipmentCost: z.coerce.number().min(0),
  status: z.enum(['in_progress', 'completed', 'cancelled']),
});

type DressingFormData = z.infer<typeof dressingSchema>;

export default function DressingFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedBlockId = searchParams.get('blockId') || '';
  const isEditing = Boolean(id);

  const { user } = useAuthStore();
  const { addRecord, updateRecord, getRecord } = useDressingStore();
  const { blocks, subscribeToBlocks, updateBlock, cleanup: cleanupBlocks } = useBlockStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(isEditing);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<DressingFormData>({
    resolver: zodResolver(dressingSchema),
    defaultValues: {
      blockId: preselectedBlockId,
      dressingType: 'normal',
      status: 'in_progress',
      dressingCost: 0,
      labourCost: 0,
      equipmentCost: 0,
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const dressingType = watch('dressingType');
  const dressingCost = watch('dressingCost') || 0;
  const labourCost = watch('labourCost') || 0;
  const equipmentCost = watch('equipmentCost') || 0;
  const totalCost = dressingCost + labourCost + equipmentCost;
  const selectedBlockId = watch('blockId');

  // Subscribe to blocks
  useEffect(() => {
    if (user?.uid) subscribeToBlocks(user.uid);
    return () => cleanupBlocks();
  }, [user?.uid]);

  // Available blocks for dressing
  const eligibleBlocks = useMemo(() => {
    return blocks.filter(b =>
      b.status === 'ready_for_dressing' || b.status === 'dressing' || b.status === 'dug'
    );
  }, [blocks]);

  // Selected block details
  const selectedBlock = useMemo(() => {
    return blocks.find(b => b.blockId === selectedBlockId);
  }, [blocks, selectedBlockId]);

  // Load existing record for editing
  useEffect(() => {
    if (isEditing && id) {
      setLoadingRecord(true);
      getRecord(id).then((record) => {
        if (record) {
          setValue('blockId', record.blockId);
          setValue('dressingType', record.dressingType);
          setValue('buyer', record.buyer || '');
          setValue('specialRequirements', record.specialRequirements || '');
          setValue('dressingCost', record.dressingCost);
          setValue('labourCost', record.labourCost);
          setValue('equipmentCost', record.equipmentCost);
          setValue('status', record.status);
          if (record.startDate) {
            setValue('startDate', record.startDate.toDate().toISOString().split('T')[0]);
          }
          if (record.completionDate) {
            setValue('completionDate', record.completionDate.toDate().toISOString().split('T')[0]);
          }
          if (record.requiredDimensions) {
            setValue('reqLength', record.requiredDimensions.length);
            setValue('reqWidth', record.requiredDimensions.width);
            setValue('reqHeight', record.requiredDimensions.height);
          }
        }
        setLoadingRecord(false);
      });
    }
  }, [isEditing, id, getRecord, setValue]);

  const onSubmit = async (data: DressingFormData) => {
    if (!user?.uid) return;
    setIsSubmitting(true);

    try {
      const costPerCBM = selectedBlock?.cbm
        ? Math.round(totalCost / selectedBlock.cbm)
        : 0;

      const recordData = {
        blockId: data.blockId,
        startDate: Timestamp.fromDate(new Date(data.startDate)),
        completionDate: data.completionDate ? Timestamp.fromDate(new Date(data.completionDate)) : null,
        dressingType: data.dressingType,
        buyer: data.dressingType === 'buyer_specific' ? (data.buyer || null) : null,
        requiredDimensions: data.reqLength && data.reqWidth && data.reqHeight
          ? { length: data.reqLength, width: data.reqWidth, height: data.reqHeight }
          : null,
        specialRequirements: data.specialRequirements || '',
        dressingCost: data.dressingCost,
        labourCost: data.labourCost,
        equipmentCost: data.equipmentCost,
        totalCost,
        costPerCBM,
        status: data.status as 'in_progress' | 'completed' | 'cancelled',
        createdBy: user.uid,
      };

      if (isEditing && id) {
        await updateRecord(id, recordData);
        toast.success('Dressing record updated');
      } else {
        await addRecord(recordData);
        // Update block status to 'dressing' if it was 'ready_for_dressing' or 'dug'
        if (selectedBlock && (selectedBlock.status === 'ready_for_dressing' || selectedBlock.status === 'dug')) {
          await updateBlock(selectedBlock.id, { status: BLOCK_STATUS.DRESSING });
        }
        toast.success('Dressing record created');
      }

      // If dressing completed, update block to ready_for_sale
      if (data.status === 'completed' && selectedBlock) {
        await updateBlock(selectedBlock.id, { status: BLOCK_STATUS.READY_FOR_SALE });
        toast.success(`${data.blockId} moved to Ready for Sale`);
      }

      navigate('/dressing');
    } catch {
      toast.error(isEditing ? 'Failed to update' : 'Failed to create');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingRecord) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 lg:p-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dressing')} className="p-2 rounded-lg hover:bg-navy-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-navy">{isEditing ? 'Edit Dressing' : 'New Dressing Job'}</h1>
          <p className="text-sm text-text-secondary">
            {isEditing ? 'Update dressing record details' : 'Start a new dressing operation'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Block Selection */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Select Block</h3>
          <select
            {...register('blockId')}
            className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
            disabled={isEditing}
          >
            <option value="">Choose a block...</option>
            {eligibleBlocks.map((block) => (
              <option key={block.id} value={block.blockId}>
                {block.blockId} — {block.graniteVariety} ({BLOCK_CATEGORY_LABELS[block.category]}) — {block.cbm.toFixed(3)} CBM
              </option>
            ))}
            {/* If editing, ensure current blockId is in the list */}
            {isEditing && selectedBlockId && !eligibleBlocks.find(b => b.blockId === selectedBlockId) && (
              <option value={selectedBlockId}>{selectedBlockId}</option>
            )}
          </select>
          {errors.blockId && <p className="text-xs text-critical mt-1">{errors.blockId.message}</p>}

          {/* Selected block info */}
          {selectedBlock && (
            <div className="mt-3 p-3 bg-navy-50 rounded-lg border border-navy-200">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-text-tertiary">Variety</p>
                  <p className="font-semibold text-navy">{selectedBlock.graniteVariety}</p>
                </div>
                <div>
                  <p className="text-text-tertiary">CBM</p>
                  <p className="font-semibold text-navy">{selectedBlock.cbm.toFixed(3)} m³</p>
                </div>
                <div>
                  <p className="text-text-tertiary">Quality</p>
                  <p className="font-semibold text-navy">{selectedBlock.quality}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dressing Type */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Dressing Type</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className={cn(
              'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
              dressingType === 'normal' ? 'border-navy bg-navy-50' : 'border-border bg-bg hover:border-border-hover'
            )}>
              <input type="radio" {...register('dressingType')} value="normal" className="sr-only" />
              <Scissors className={cn('w-5 h-5', dressingType === 'normal' ? 'text-navy' : 'text-text-tertiary')} />
              <div>
                <p className={cn('text-sm font-semibold', dressingType === 'normal' ? 'text-navy' : 'text-text-secondary')}>Normal</p>
                <p className="text-[10px] text-text-tertiary">Standard dressing</p>
              </div>
            </label>
            <label className={cn(
              'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
              dressingType === 'buyer_specific' ? 'border-teal bg-teal-50' : 'border-border bg-bg hover:border-border-hover'
            )}>
              <input type="radio" {...register('dressingType')} value="buyer_specific" className="sr-only" />
              <Scissors className={cn('w-5 h-5', dressingType === 'buyer_specific' ? 'text-teal' : 'text-text-tertiary')} />
              <div>
                <p className={cn('text-sm font-semibold', dressingType === 'buyer_specific' ? 'text-teal' : 'text-text-secondary')}>Buyer Specific</p>
                <p className="text-[10px] text-text-tertiary">Custom for buyer</p>
              </div>
            </label>
          </div>

          {/* Buyer field */}
          {dressingType === 'buyer_specific' && (
            <div className="mt-4">
              <label className="block text-xs font-medium text-text-secondary mb-1">Buyer Name *</label>
              <input
                {...register('buyer')}
                type="text"
                placeholder="Enter buyer name"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Dates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Start Date *</label>
              <input {...register('startDate')} type="date"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all" />
              {errors.startDate && <p className="text-xs text-critical mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Completion Date</label>
              <input {...register('completionDate')} type="date"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all" />
            </div>
          </div>
        </div>

        {/* Required Dimensions (buyer-specific) */}
        {dressingType === 'buyer_specific' && (
          <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Required Dimensions (cm)</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Length</label>
                <input {...register('reqLength')} type="number" step="0.1" placeholder="cm"
                  className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Width</label>
                <input {...register('reqWidth')} type="number" step="0.1" placeholder="cm"
                  className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Height</label>
                <input {...register('reqHeight')} type="number" step="0.1" placeholder="cm"
                  className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all" />
              </div>
            </div>
          </div>
        )}

        {/* Special Requirements */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Special Requirements</h3>
          <textarea
            {...register('specialRequirements')}
            rows={3}
            placeholder="Any special instructions or requirements..."
            className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all resize-none"
          />
        </div>

        {/* Costs */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Costs (₹)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Dressing Cost</label>
              <input {...register('dressingCost')} type="number" step="1" placeholder="₹"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Labour Cost</label>
              <input {...register('labourCost')} type="number" step="1" placeholder="₹"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Equipment Cost</label>
              <input {...register('equipmentCost')} type="number" step="1" placeholder="₹"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all" />
            </div>
          </div>

          {/* Total Cost */}
          <div className="mt-4 p-3 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-teal-800">Total Cost</span>
              {selectedBlock?.cbm ? (
                <p className="text-[10px] text-teal-700">
                  ₹{Math.round(totalCost / selectedBlock.cbm).toLocaleString('en-IN')} per CBM
                </p>
              ) : null}
            </div>
            <span className="text-xl font-bold text-teal">₹{totalCost.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Dressing Status</h3>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'in_progress', label: 'In Progress', color: 'border-info bg-info-bg text-info' },
              { value: 'completed', label: 'Completed', color: 'border-success bg-success-bg text-success' },
              { value: 'cancelled', label: 'Cancelled', color: 'border-gray-300 bg-gray-50 text-gray-500' },
            ] as const).map((opt) => {
              const isSelected = watch('status') === opt.value;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium',
                    isSelected ? opt.color : 'border-border bg-bg text-text-secondary hover:bg-surface-hover'
                  )}
                >
                  <input type="radio" {...register('status')} value={opt.value} className="sr-only" />
                  {opt.label}
                </label>
              );
            })}
          </div>
          {watch('status') === 'completed' && (
            <p className="mt-2 text-xs text-success font-medium">
              ✅ Block will automatically move to "Ready for Sale" status
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/dressing')}
            className="flex-1 py-3 bg-bg border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}
            className="flex-1 py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{isEditing ? 'Updating...' : 'Saving...'}</>
            ) : (
              <><Save className="w-4 h-4" />{isEditing ? 'Update' : 'Save Dressing'}</>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
