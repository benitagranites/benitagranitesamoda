// Benita Granites — Block Detail View
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Pencil, Trash2, Loader2, Mountain,
  MapPin, Ruler, Calendar, Tag, Layers, Star,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn, getStatusColor } from '@/lib/utils';
import { useBlockStore } from '@/stores/blockStore';
import {
  BLOCK_CATEGORY_LABELS, BLOCK_STATUS_LABELS,
  BLOCK_STATUS_FLOW,
} from '@/constants';
import type { Block } from '@/types';
import type { BlockStatus } from '@/constants';
import toast from 'react-hot-toast';

const categoryColors: Record<string, string> = {
  gang_saw: 'bg-navy-50 text-navy border-navy-200',
  cutter: 'bg-teal-50 text-teal border-teal-200',
  commercial: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function BlockDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getBlock, updateBlock, deleteBlock } = useBlockStore();

  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getBlock(id).then((b) => {
        setBlock(b);
        setLoading(false);
      });
    }
  }, [id, getBlock]);

  const handleStatusChange = async (newStatus: BlockStatus) => {
    if (!id || !block) return;
    try {
      await updateBlock(id, { status: newStatus });
      setBlock({ ...block, status: newStatus });
      toast.success(`Status updated to ${BLOCK_STATUS_LABELS[newStatus]}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteBlock(id);
      toast.success('Block deleted');
      navigate('/production');
    } catch {
      toast.error('Failed to delete block');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!block) {
    return (
      <div className="p-4 lg:p-6 text-center">
        <p className="text-text-secondary">Block not found.</p>
        <button onClick={() => navigate('/production')} className="mt-4 text-teal font-semibold text-sm">
          ← Back to blocks
        </button>
      </div>
    );
  }

  const hasPhotos = block.photos && block.photos.length > 0;
  const dateExcavated = block.dateExcavated?.toDate?.();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/production')} className="p-2 rounded-lg hover:bg-navy-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-navy" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-navy">{block.blockId}</h1>
              <span className={cn('px-2.5 py-0.5 rounded-md text-xs font-medium border', categoryColors[block.category])}>
                {BLOCK_CATEGORY_LABELS[block.category]}
              </span>
            </div>
            <p className="text-sm text-text-secondary">{block.graniteVariety}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/production/${id}/edit`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-teal text-white hover:bg-teal-800 transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-xl text-text-tertiary hover:bg-critical-bg hover:text-critical transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Photo Gallery — Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Photo */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            {hasPhotos ? (
              <div className="relative">
                <div className="aspect-video bg-bg">
                  <img
                    src={block.photos[photoIndex]}
                    alt={`${block.blockId} - Photo ${photoIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                {block.photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIndex((i) => (i > 0 ? i - 1 : block.photos.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPhotoIndex((i) => (i < block.photos.length - 1 ? i + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {block.photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPhotoIndex(i)}
                          className={cn('w-2 h-2 rounded-full transition-all', i === photoIndex ? 'bg-white w-4' : 'bg-white/50')}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-bg flex items-center justify-center">
                <Mountain className="w-16 h-16 text-text-tertiary" />
              </div>
            )}

            {/* Photo Thumbnails */}
            {hasPhotos && block.photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {block.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={cn(
                      'w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all',
                      i === photoIndex ? 'border-teal' : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dimensions Card */}
          <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-teal" /> Dimensions & Volume
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-bg rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-text-primary">{block.dimensions.length}</p>
                <p className="text-[10px] text-text-secondary font-medium">Length (cm)</p>
              </div>
              <div className="bg-bg rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-text-primary">{block.dimensions.width}</p>
                <p className="text-[10px] text-text-secondary font-medium">Width (cm)</p>
              </div>
              <div className="bg-bg rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-text-primary">{block.dimensions.height}</p>
                <p className="text-[10px] text-text-secondary font-medium">Height (cm)</p>
              </div>
              <div className="bg-teal-50 rounded-lg p-3 text-center border border-teal-200">
                <p className="text-lg font-bold text-teal">{block.cbm.toFixed(3)}</p>
                <p className="text-[10px] text-teal-800 font-medium">CBM (m³)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Details */}
        <div className="space-y-5">
          {/* Status Card */}
          <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Status</h3>
            <div className="space-y-2">
              {BLOCK_STATUS_FLOW.map((status) => {
                const isActive = block.status === status;
                const statusIdx = BLOCK_STATUS_FLOW.indexOf(status);
                const currentIdx = BLOCK_STATUS_FLOW.indexOf(block.status);
                const isPast = statusIdx < currentIdx;

                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left',
                      isActive
                        ? 'bg-navy text-white shadow-sm'
                        : isPast
                          ? 'bg-success-bg text-success border border-success-border'
                          : 'bg-bg text-text-secondary hover:bg-navy-50 hover:text-navy'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold',
                      isActive ? 'bg-white text-navy' : isPast ? 'bg-success text-white' : 'bg-border text-text-tertiary'
                    )}>
                      {isPast ? '✓' : statusIdx + 1}
                    </div>
                    {BLOCK_STATUS_LABELS[status]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Details</h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <Tag className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-text-tertiary font-medium">Quality Grade</p>
                  <p className="text-sm font-medium text-text-primary">{block.quality}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Layers className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-text-tertiary font-medium">Pit / Bench</p>
                  <p className="text-sm font-medium text-text-primary">{block.pit} / {block.bench}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-text-tertiary font-medium">Current Location</p>
                  <p className="text-sm font-medium text-text-primary">{block.currentLocation || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-text-tertiary font-medium">Date Excavated</p>
                  <p className="text-sm font-medium text-text-primary">
                    {dateExcavated ? dateExcavated.toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    }) : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Star className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-text-tertiary font-medium">Granite Variety</p>
                  <p className="text-sm font-medium text-text-primary">{block.graniteVariety}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowDeleteModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-surface rounded-2xl border border-border shadow-xl p-6 z-50">
            <div className="w-12 h-12 rounded-xl bg-critical-bg flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-critical" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary text-center mb-1">Delete {block.blockId}?</h3>
            <p className="text-sm text-text-secondary text-center mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 bg-bg border border-border rounded-xl text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-critical text-white rounded-xl text-sm font-semibold">
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
