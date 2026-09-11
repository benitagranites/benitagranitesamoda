// Benita Granites — Dressing List Page
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Loader2, Scissors, Eye, Pencil, Trash2,
  X, AlertTriangle, } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useDressingStore } from '@/stores/dressingStore';
import { useBlockStore } from '@/stores/blockStore';
import { BLOCK_CATEGORY_LABELS } from '@/constants';
import type { DressingRecord, Block } from '@/types';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const dressingStatusColors: Record<string, string> = {
  in_progress: 'bg-info-bg text-info border-info-border',
  completed: 'bg-success-bg text-success border-success-border',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};
const dressingStatusLabels: Record<string, string> = {
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Block status pipeline
const STATUS_PIPELINE = [
  { key: 'dug', label: 'Dug', icon: '⛏️' },
  { key: 'ready_for_dressing', label: 'Ready for Dressing', icon: '📦' },
  { key: 'dressing', label: 'Dressing', icon: '✂️' },
  { key: 'ready_for_sale', label: 'Ready for Sale', icon: '✅' },
  { key: 'reserved', label: 'Reserved', icon: '🔖' },
  { key: 'sold', label: 'Sold', icon: '💰' },
  { key: 'dispatched', label: 'Dispatched', icon: '🚚' },
];

export default function DressingListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { records, loading, error, subscribeToRecords, deleteRecord, cleanup } = useDressingStore();
  const { blocks, subscribeToBlocks, cleanup: cleanupBlocks } = useBlockStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      subscribeToRecords(user.uid);
      subscribeToBlocks(user.uid);
    }
    return () => {
      cleanup();
      cleanupBlocks();
    };
  }, [user?.uid]);

  // Map block IDs to blocks for quick lookup
  const blockMap = useMemo(() => {
    const map: Record<string, Block> = {};
    blocks.forEach((b) => { map[b.blockId] = b; map[b.id] = b; });
    return map;
  }, [blocks]);

  // Blocks ready for dressing (not yet having a dressing record)
  const blocksReadyForDressing = useMemo(() => {
    const dressingBlockIds = new Set(records.map(r => r.blockId));
    return blocks.filter(b =>
      (b.status === 'ready_for_dressing' || b.status === 'dressing') &&
      !dressingBlockIds.has(b.blockId)
    );
  }, [blocks, records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const block = blockMap[r.blockId];
        return (
          r.blockId.toLowerCase().includes(s) ||
          (r.buyer || '').toLowerCase().includes(s) ||
          (block?.graniteVariety || '').toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [records, statusFilter, search, blockMap]);

  // Stats
  const stats = useMemo(() => ({
    total: records.length,
    inProgress: records.filter(r => r.status === 'in_progress').length,
    completed: records.filter(r => r.status === 'completed').length,
    totalCost: records.reduce((sum, r) => sum + (r.totalCost || 0), 0),
    avgCostPerCBM: records.length > 0
      ? records.reduce((sum, r) => sum + (r.costPerCBM || 0), 0) / records.length
      : 0,
  }), [records]);

  const handleDelete = async (id: string) => {
    try {
      await deleteRecord(id);
      toast.success('Dressing record deleted');
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete record');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">Dressing</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage block dressing operations and track costs</p>
        </div>
        <Link
          to="/dressing/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 active:scale-[0.98] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Dressing
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Jobs', value: stats.total, color: 'text-navy' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-info' },
          { label: 'Completed', value: stats.completed, color: 'text-success' },
          { label: 'Total Cost', value: formatINR(stats.totalCost), color: 'text-slate-blue' },
          { label: 'Avg ₹/CBM', value: formatINR(stats.avgCostPerCBM), color: 'text-teal' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border p-3 text-center">
            <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
            <p className="text-[10px] text-text-secondary font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Blocks Ready for Dressing — Pipeline Alert */}
      {blocksReadyForDressing.length > 0 && (
        <motion.div variants={itemVariants} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            📦 {blocksReadyForDressing.length} block(s) ready for dressing
          </p>
          <div className="flex flex-wrap gap-2">
            {blocksReadyForDressing.map(b => (
              <Link
                key={b.id}
                to={`/dressing/new?blockId=${b.blockId}`}
                className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
              >
                {b.blockId} — {b.graniteVariety}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search & Filter */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by Block ID, buyer, variety..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {['all', 'in_progress', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-2.5 rounded-xl text-xs font-medium transition-colors',
                statusFilter === s ? 'bg-navy text-white' : 'bg-surface border border-border text-text-secondary hover:bg-navy-50'
              )}
            >
              {s === 'all' ? 'All' : dressingStatusLabels[s]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div variants={itemVariants} className="bg-critical-bg border border-critical-border rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-critical shrink-0" />
          <p className="text-sm text-critical">{error}</p>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredRecords.length === 0 && !loading && (
        <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-navy" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">No dressing records</h3>
          <p className="text-sm text-text-secondary mb-6">
            {records.length === 0 ? 'Start a dressing job by selecting a block.' : 'No records match your filters.'}
          </p>
          {records.length === 0 && (
            <Link to="/dressing/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-all">
              <Plus className="w-4 h-4" /> Start Dressing
            </Link>
          )}
        </motion.div>
      )}

      {/* Dressing Cards */}
      {filteredRecords.length > 0 && (
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRecords.map((record) => {
            const block = blockMap[record.blockId];
            return (
              <DressingCard
                key={record.id}
                record={record}
                block={block}
                onView={() => navigate(`/dressing/${record.id}`)}
                onEdit={() => navigate(`/dressing/${record.id}/edit`)}
                onDelete={() => setDeleteConfirm(record.id)}
              />
            );
          })}
        </motion.div>
      )}

      {/* Status Pipeline Legend */}
      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-border p-4">
        <h3 className="text-xs font-semibold text-text-secondary mb-3">BLOCK STATUS PIPELINE</h3>
        <div className="flex flex-wrap items-center gap-1">
          {STATUS_PIPELINE.map((step, i) => (
            <div key={step.key} className="flex items-center gap-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg text-[11px] font-medium text-text-primary">
                <span>{step.icon}</span>
                <span>{step.label}</span>
              </div>
              {i < STATUS_PIPELINE.length - 1 && (
                <span className="text-text-tertiary text-xs mx-0.5">→</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-surface rounded-2xl border border-border shadow-xl p-6 z-50">
              <div className="w-12 h-12 rounded-xl bg-critical-bg flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-critical" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary text-center mb-1">Delete Record?</h3>
              <p className="text-sm text-text-secondary text-center mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-bg border border-border rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-critical text-white rounded-xl text-sm font-semibold">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// DRESSING CARD
// ============================================
interface DressingCardProps {
  record: DressingRecord;
  block?: Block;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DressingCard({ record, block, onView, onEdit, onDelete }: DressingCardProps) {
  const startDate = record.startDate?.toDate?.();
  

  // Block status pipeline position
  const blockStatus = block?.status || 'dug';
  const pipelineIdx = STATUS_PIPELINE.findIndex(s => s.key === blockStatus);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-surface rounded-xl border border-border p-4 hover:shadow-md transition-shadow group cursor-pointer"
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-navy">{record.blockId}</p>
          <p className="text-xs text-text-secondary mt-0.5">
            {block?.graniteVariety || 'Unknown Variety'} — {block ? BLOCK_CATEGORY_LABELS[block.category] : ''}
          </p>
        </div>
        <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-medium border', dressingStatusColors[record.status])}>
          {dressingStatusLabels[record.status]}
        </span>
      </div>

      {/* Mini Pipeline */}
      <div className="flex items-center gap-0.5 mb-3">
        {STATUS_PIPELINE.map((step, i) => (
          <div key={step.key} className="flex items-center gap-0.5 flex-1">
            <div className={cn(
              'h-1.5 flex-1 rounded-full transition-all',
              i <= pipelineIdx ? 'bg-teal' : 'bg-border'
            )} />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-text-tertiary mb-3">
        Status: <span className="font-medium text-text-primary">{STATUS_PIPELINE[pipelineIdx]?.label || blockStatus}</span>
      </p>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-text-tertiary">Type</p>
          <p className="font-medium text-text-primary">{record.dressingType === 'buyer_specific' ? 'Buyer Specific' : 'Normal'}</p>
        </div>
        <div>
          <p className="text-text-tertiary">Buyer</p>
          <p className="font-medium text-text-primary truncate">{record.buyer || '—'}</p>
        </div>
        <div>
          <p className="text-text-tertiary">Start</p>
          <p className="font-medium text-text-primary">
            {startDate ? startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
          </p>
        </div>
        <div>
          <p className="text-text-tertiary">Total Cost</p>
          <p className="font-semibold text-teal">{formatINR(record.totalCost || 0)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button onClick={onView} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-navy hover:bg-navy-50 transition-colors">
          <Eye className="w-3.5 h-3.5" /> View
        </button>
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-teal hover:bg-teal-50 transition-colors">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-critical hover:bg-critical-bg transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </motion.div>
  );
}
