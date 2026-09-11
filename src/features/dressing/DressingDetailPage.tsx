// Benita Granites — Dressing Detail View
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Pencil, Trash2, Loader2, Scissors,
  Calendar, DollarSign, Ruler, User, Tag, CheckCircle2,
} from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { useDressingStore } from '@/stores/dressingStore';
import { useBlockStore } from '@/stores/blockStore';
import { useAuthStore } from '@/stores/authStore';
import { BLOCK_CATEGORY_LABELS, BLOCK_STATUS, BLOCK_STATUS_LABELS } from '@/constants';
import type { DressingRecord } from '@/types';
import type { BlockStatus } from '@/constants';
import toast from 'react-hot-toast';

const STATUS_PIPELINE = [
  { key: 'dug', label: 'Dug', icon: '⛏️' },
  { key: 'ready_for_dressing', label: 'Ready for Dressing', icon: '📦' },
  { key: 'dressing', label: 'Dressing', icon: '✂️' },
  { key: 'ready_for_sale', label: 'Ready for Sale', icon: '✅' },
  { key: 'reserved', label: 'Reserved', icon: '🔖' },
  { key: 'sold', label: 'Sold', icon: '💰' },
  { key: 'dispatched', label: 'Dispatched', icon: '🚚' },
];

const dressingStatusLabels: Record<string, string> = {
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
const dressingStatusColors: Record<string, string> = {
  in_progress: 'bg-info-bg text-info border-info-border',
  completed: 'bg-success-bg text-success border-success-border',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

export default function DressingDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getRecord, updateRecord, deleteRecord } = useDressingStore();
  const { blocks, subscribeToBlocks, updateBlock, cleanup: cleanupBlocks } = useBlockStore();
  const { user } = useAuthStore();

  const [record, setRecord] = useState<DressingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user?.uid) subscribeToBlocks(user.uid);
    return () => cleanupBlocks();
  }, [user?.uid]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getRecord(id).then((r) => {
        setRecord(r);
        setLoading(false);
      });
    }
  }, [id, getRecord]);

  const block = useMemo(() => {
    if (!record) return null;
    return blocks.find(b => b.blockId === record.blockId) || null;
  }, [blocks, record]);

  const pipelineIdx = useMemo(() => {
    const status = block?.status || 'dug';
    return STATUS_PIPELINE.findIndex(s => s.key === status);
  }, [block]);

  const handleStatusUpdate = async (newBlockStatus: BlockStatus) => {
    if (!block) return;
    try {
      await updateBlock(block.id, { status: newBlockStatus });
      toast.success(`Block moved to ${BLOCK_STATUS_LABELS[newBlockStatus]}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleCompleteDressing = async () => {
    if (!id || !record || !block) return;
    try {
      await updateRecord(id, { status: 'completed' });
      await updateBlock(block.id, { status: BLOCK_STATUS.READY_FOR_SALE });
      setRecord({ ...record, status: 'completed' });
      toast.success('Dressing completed! Block moved to Ready for Sale');
    } catch {
      toast.error('Failed to complete dressing');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteRecord(id);
      toast.success('Dressing record deleted');
      navigate('/dressing');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-4 lg:p-6 text-center">
        <p className="text-text-secondary">Dressing record not found.</p>
        <button onClick={() => navigate('/dressing')} className="mt-4 text-teal font-semibold text-sm">← Back</button>
      </div>
    );
  }

  const startDate = record.startDate?.toDate?.();
  const completionDate = record.completionDate?.toDate?.();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dressing')} className="p-2 rounded-lg hover:bg-navy-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-navy" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-navy">{record.blockId}</h1>
              <span className={cn('px-2.5 py-0.5 rounded-md text-xs font-medium border', dressingStatusColors[record.status])}>
                {dressingStatusLabels[record.status]}
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {record.dressingType === 'buyer_specific' ? 'Buyer Specific' : 'Normal'} Dressing
              {record.buyer && ` — ${record.buyer}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/dressing/${id}/edit`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-teal text-white hover:bg-teal-800 transition-colors">
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-xl text-text-tertiary hover:bg-critical-bg hover:text-critical transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Block Status Pipeline</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STATUS_PIPELINE.map((step, i) => {
            const isActive = i === pipelineIdx;
            const isPast = i < pipelineIdx;
            return (
              <button
                key={step.key}
                onClick={() => handleStatusUpdate(step.key as BlockStatus)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  isActive ? 'bg-navy text-white shadow-sm scale-105' :
                  isPast ? 'bg-success-bg text-success border border-success-border' :
                  'bg-bg text-text-secondary hover:bg-navy-50'
                )}
              >
                <span>{step.icon}</span>
                <span>{step.label}</span>
                {isPast && <CheckCircle2 className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
        {record.status === 'in_progress' && (
          <button
            onClick={handleCompleteDressing}
            className="mt-4 w-full py-3 bg-success text-white rounded-xl text-sm font-semibold hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Dressing → Move to Ready for Sale
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Block Info */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Block Details</h3>
          {block ? (
            <div className="space-y-2.5">
              <InfoRow icon={Tag} label="Block ID" value={block.blockId} />
              <InfoRow icon={Tag} label="Category" value={BLOCK_CATEGORY_LABELS[block.category]} />
              <InfoRow icon={Tag} label="Variety" value={block.graniteVariety} />
              <InfoRow icon={Ruler} label="Dimensions" value={`${block.dimensions.length}×${block.dimensions.width}×${block.dimensions.height} cm`} />
              <InfoRow icon={Ruler} label="CBM" value={`${block.cbm.toFixed(3)} m³`} highlight />
              <InfoRow icon={Tag} label="Quality" value={block.quality} />
            </div>
          ) : (
            <p className="text-sm text-text-secondary">Block not found in your records</p>
          )}
        </div>

        {/* Dressing Info */}
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Dressing Details</h3>
          <div className="space-y-2.5">
            <InfoRow icon={Scissors} label="Type" value={record.dressingType === 'buyer_specific' ? 'Buyer Specific' : 'Normal'} />
            {record.buyer && <InfoRow icon={User} label="Buyer" value={record.buyer} />}
            <InfoRow icon={Calendar} label="Start Date"
              value={startDate ? startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
            <InfoRow icon={Calendar} label="Completion"
              value={completionDate ? completionDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Ongoing'} />
            {record.requiredDimensions && (
              <InfoRow icon={Ruler} label="Required Dims"
                value={`${record.requiredDimensions.length}×${record.requiredDimensions.width}×${record.requiredDimensions.height} cm`} />
            )}
            {record.specialRequirements && (
              <div className="pt-2 border-t border-border">
                <p className="text-[10px] text-text-tertiary font-medium mb-1">Special Requirements</p>
                <p className="text-sm text-text-primary">{record.specialRequirements}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-surface rounded-xl border border-border p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-teal" /> Cost Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-bg rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-text-primary">{formatINR(record.dressingCost)}</p>
            <p className="text-[10px] text-text-secondary font-medium">Dressing</p>
          </div>
          <div className="bg-bg rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-text-primary">{formatINR(record.labourCost)}</p>
            <p className="text-[10px] text-text-secondary font-medium">Labour</p>
          </div>
          <div className="bg-bg rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-text-primary">{formatINR(record.equipmentCost)}</p>
            <p className="text-[10px] text-text-secondary font-medium">Equipment</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-3 text-center border border-teal-200">
            <p className="text-lg font-bold text-teal">{formatINR(record.totalCost)}</p>
            <p className="text-[10px] text-teal-800 font-medium">Total Cost</p>
          </div>
        </div>
        {block?.cbm && record.totalCost > 0 && (
          <div className="mt-3 p-3 bg-navy-50 rounded-lg border border-navy-200 flex items-center justify-between">
            <span className="text-sm font-medium text-navy-800">Cost per CBM</span>
            <span className="text-lg font-bold text-navy">{formatINR(record.costPerCBM)}</span>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowDeleteModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-surface rounded-2xl border border-border shadow-xl p-6 z-50">
            <div className="w-12 h-12 rounded-xl bg-critical-bg flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-critical" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary text-center mb-1">Delete Record?</h3>
            <p className="text-sm text-text-secondary text-center mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 bg-bg border border-border rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-critical text-white rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

// Info Row Helper
function InfoRow({ icon: Icon, label, value, highlight }: {
  icon: typeof Tag;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-text-tertiary font-medium">{label}</p>
        <p className={cn('text-sm font-medium', highlight ? 'text-teal font-semibold' : 'text-text-primary')}>{value}</p>
      </div>
    </div>
  );
}
