// Benita Granites — Add / Edit Block Form
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Loader2, Save, Camera, X, Mountain,
} from 'lucide-react';
import { cn, calculateCBM } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useBlockStore } from '@/stores/blockStore';
import { uploadToCloudinary } from '@/cloudinary/upload';
import {
  BLOCK_CATEGORIES, BLOCK_CATEGORY_LABELS,
  BLOCK_STATUS, BLOCK_STATUS_LABELS,
} from '@/constants';
import type { BlockCategory, BlockStatus } from '@/constants';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const blockSchema = z.object({
  category: z.enum(['gang_saw', 'cutter', 'commercial']),
  graniteVariety: z.string().min(1, 'Granite variety is required'),
  pit: z.string().min(1, 'Pit is required'),
  bench: z.string().min(1, 'Bench is required'),
  dateExcavated: z.string().min(1, 'Date excavated is required'),
  length: z.coerce.number().min(1, 'Length must be > 0'),
  width: z.coerce.number().min(1, 'Width must be > 0'),
  height: z.coerce.number().min(1, 'Height must be > 0'),
  quality: z.string().min(1, 'Quality is required'),
  currentLocation: z.string().min(1, 'Current location is required'),
  status: z.string(),
});

type BlockFormData = z.infer<typeof blockSchema>;

export default function BlockFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { user } = useAuthStore();
  const { addBlock, updateBlock, getBlock, getNextBlockNumber } = useBlockStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [blockId, setBlockId] = useState('');
  const [cbm, setCbm] = useState(0);
  const [loadingBlock, setLoadingBlock] = useState(isEditing);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlockFormData>({
    resolver: zodResolver(blockSchema),
    defaultValues: {
      category: 'gang_saw',
      quality: 'A',
      status: 'dug',
      dateExcavated: new Date().toISOString().split('T')[0],
    },
  });

  const length = watch('length');
  const width = watch('width');
  const height = watch('height');

  // Auto-calculate CBM
  useEffect(() => {
    if (length > 0 && width > 0 && height > 0) {
      setCbm(calculateCBM(length, width, height));
    }
  }, [length, width, height]);

  // Generate block ID for new blocks
  useEffect(() => {
    if (!isEditing && user?.uid) {
      getNextBlockNumber(user.uid).then(setBlockId);
    }
  }, [isEditing, user?.uid, getNextBlockNumber]);

  // Load existing block for editing
  useEffect(() => {
    if (isEditing && id) {
      setLoadingBlock(true);
      getBlock(id).then((block) => {
        if (block) {
          setBlockId(block.blockId);
          setPhotos(block.photos || []);
          setCbm(block.cbm);
          setValue('category', block.category);
          setValue('graniteVariety', block.graniteVariety);
          setValue('pit', block.pit);
          setValue('bench', block.bench);
          setValue('quality', block.quality);
          setValue('currentLocation', block.currentLocation);
          setValue('status', block.status);
          setValue('length', block.dimensions.length);
          setValue('width', block.dimensions.width);
          setValue('height', block.dimensions.height);
          if (block.dateExcavated) {
            const d = block.dateExcavated.toDate();
            setValue('dateExcavated', d.toISOString().split('T')[0]);
          }
        }
        setLoadingBlock(false);
      });
    }
  }, [isEditing, id, getBlock, setValue]);

  // Photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const result = await uploadToCloudinary(file, 'blocks');
      setPhotos((prev) => [...prev, result.secure_url]);
      toast.success('Photo uploaded');
    } catch {
      toast.error('Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: BlockFormData) => {
    if (!user?.uid) return;
    setIsSubmitting(true);

    try {
      const blockData = {
        blockId,
        category: data.category as BlockCategory,
        graniteVariety: data.graniteVariety,
        pit: data.pit,
        bench: data.bench,
        dateExcavated: Timestamp.fromDate(new Date(data.dateExcavated)),
        dimensions: {
          length: data.length,
          width: data.width,
          height: data.height,
        },
        cbm,
        quality: data.quality,
        photos,
        currentLocation: data.currentLocation,
        status: data.status as BlockStatus,
        ownerId: user.uid,
        createdBy: user.uid,
      };

      if (isEditing && id) {
        await updateBlock(id, blockData);
        toast.success('Block updated successfully');
      } else {
        await addBlock(blockData);
        toast.success('Block added successfully');
      }

      navigate('/production');
    } catch {
      toast.error(isEditing ? 'Failed to update block' : 'Failed to add block');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingBlock) {
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
        <button
          onClick={() => navigate('/production')}
          className="p-2 rounded-lg hover:bg-navy-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-navy">
            {isEditing ? 'Edit Block' : 'New Block'}
          </h1>
          <p className="text-sm text-text-secondary">
            {blockId && <span className="font-semibold text-teal">{blockId}</span>}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Category Selection */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Category</h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(BLOCK_CATEGORY_LABELS).map(([key, label]) => {
              const isSelected = watch('category') === key;
              return (
                <label
                  key={key}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all text-center',
                    isSelected
                      ? 'border-navy bg-navy-50 text-navy'
                      : 'border-border bg-bg text-text-secondary hover:border-border-hover'
                  )}
                >
                  <Mountain className={cn('w-5 h-5', isSelected ? 'text-navy' : 'text-text-tertiary')} />
                  <span className="text-xs font-semibold">{label}</span>
                  <input
                    type="radio"
                    {...register('category')}
                    value={key}
                    className="sr-only"
                  />
                </label>
              );
            })}
          </div>
          {errors.category && <p className="text-xs text-critical mt-1">{errors.category.message}</p>}
        </div>

        {/* Block Details */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Block Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Granite Variety */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Granite Variety *</label>
              <input
                {...register('graniteVariety')}
                type="text"
                placeholder="e.g. Black Galaxy, Tan Brown"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
              {errors.graniteVariety && <p className="text-xs text-critical mt-1">{errors.graniteVariety.message}</p>}
            </div>

            {/* Quality */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Quality *</label>
              <select
                {...register('quality')}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              >
                <option value="A">A — Premium</option>
                <option value="B">B — Standard</option>
                <option value="C">C — Commercial</option>
                <option value="D">D — Reject</option>
              </select>
              {errors.quality && <p className="text-xs text-critical mt-1">{errors.quality.message}</p>}
            </div>

            {/* Pit */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Pit *</label>
              <input
                {...register('pit')}
                type="text"
                placeholder="e.g. Pit 1"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
              {errors.pit && <p className="text-xs text-critical mt-1">{errors.pit.message}</p>}
            </div>

            {/* Bench */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Bench *</label>
              <input
                {...register('bench')}
                type="text"
                placeholder="e.g. Bench 3"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
              {errors.bench && <p className="text-xs text-critical mt-1">{errors.bench.message}</p>}
            </div>

            {/* Date Excavated */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Date Excavated *</label>
              <input
                {...register('dateExcavated')}
                type="date"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
              {errors.dateExcavated && <p className="text-xs text-critical mt-1">{errors.dateExcavated.message}</p>}
            </div>

            {/* Current Location */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Current Location *</label>
              <input
                {...register('currentLocation')}
                type="text"
                placeholder="e.g. Yard A, Block 12"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
              {errors.currentLocation && <p className="text-xs text-critical mt-1">{errors.currentLocation.message}</p>}
            </div>

            {/* Status (for editing) */}
            {isEditing && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
                >
                  {Object.entries(BLOCK_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Dimensions & CBM */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Dimensions (cm)</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Length *</label>
              <input
                {...register('length')}
                type="number"
                step="0.1"
                placeholder="cm"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
              {errors.length && <p className="text-xs text-critical mt-1">{errors.length.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Width *</label>
              <input
                {...register('width')}
                type="number"
                step="0.1"
                placeholder="cm"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
              {errors.width && <p className="text-xs text-critical mt-1">{errors.width.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Height *</label>
              <input
                {...register('height')}
                type="number"
                step="0.1"
                placeholder="cm"
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
              {errors.height && <p className="text-xs text-critical mt-1">{errors.height.message}</p>}
            </div>
          </div>

          {/* CBM Display */}
          <div className="mt-4 p-3 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-between">
            <span className="text-sm font-medium text-teal-800">Calculated CBM</span>
            <span className="text-xl font-bold text-teal">{cbm.toFixed(3)} m³</span>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Photos</h3>

          {/* Photo Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={photo} alt={`Block photo ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}

            {/* Upload Button */}
            <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-teal hover:bg-teal-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors">
              {uploadingPhoto ? (
                <Loader2 className="w-5 h-5 animate-spin text-teal" />
              ) : (
                <>
                  <Camera className="w-5 h-5 text-text-tertiary mb-1" />
                  <span className="text-[10px] text-text-tertiary font-medium">Add Photo</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="sr-only"
              />
            </label>
          </div>
          <p className="text-[10px] text-text-tertiary">Upload photos of the granite block. Max 5 photos.</p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/production')}
            className="flex-1 py-3 bg-bg border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Update Block' : 'Save Block'}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
