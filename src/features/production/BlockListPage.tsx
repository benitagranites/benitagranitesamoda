// Benita Granites — Block Production List Page
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Mountain, Eye, Pencil, Trash2,
  ChevronDown, X, Loader2, Package, AlertTriangle,
} from 'lucide-react';
import { cn, getStatusColor } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useBlockStore } from '@/stores/blockStore';
import {
  BLOCK_CATEGORIES, BLOCK_CATEGORY_LABELS,
  BLOCK_STATUS, BLOCK_STATUS_LABELS,
} from '@/constants';
import type { BlockCategory, BlockStatus } from '@/constants';
import type { Block } from '@/types';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Category badge colors
const categoryColors: Record<string, string> = {
  gang_saw: 'bg-navy-50 text-navy border-navy-200',
  cutter: 'bg-teal-50 text-teal border-teal-200',
  commercial: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function BlockListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { blocks, loading, error, filters, subscribeToBlocks, setFilters, deleteBlock, cleanup } = useBlockStore();
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    if (user?.uid) {
      subscribeToBlocks(user.uid);
    }
    return () => cleanup();
  }, [user?.uid, subscribeToBlocks, cleanup]);

  // Filtered blocks
  const filteredBlocks = useMemo(() => {
    return blocks.filter((block) => {
      if (filters.category !== 'all' && block.category !== filters.category) return false;
      if (filters.status !== 'all' && block.status !== filters.status) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        return (
          block.blockId.toLowerCase().includes(s) ||
          block.graniteVariety.toLowerCase().includes(s) ||
          block.pit.toLowerCase().includes(s) ||
          block.currentLocation.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [blocks, filters]);

  // Stats
  const stats = useMemo(() => {
    const total = blocks.length;
    const gangSaw = blocks.filter((b) => b.category === 'gang_saw').length;
    const cutter = blocks.filter((b) => b.category === 'cutter').length;
    const commercial = blocks.filter((b) => b.category === 'commercial').length;
    const totalCBM = blocks.reduce((sum, b) => sum + (b.cbm || 0), 0);
    return { total, gangSaw, cutter, commercial, totalCBM };
  }, [blocks]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBlock(id);
      toast.success('Block deleted successfully');
      setDeleteConfirm(null);
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 lg:p-6 space-y-5"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">
            Block Production
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage granite block production records
          </p>
        </div>
        <Link
          to="/production/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 active:scale-[0.98] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Block
        </Link>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Blocks', value: stats.total, color: 'text-navy' },
          { label: 'Gang Saw', value: stats.gangSaw, color: 'text-navy' },
          { label: 'Cutter', value: stats.cutter, color: 'text-teal' },
          { label: 'Commercial', value: stats.commercial, color: 'text-amber-700' },
          { label: 'Total CBM', value: stats.totalCBM.toFixed(2), color: 'text-slate-blue' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border p-3 text-center">
            <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
            <p className="text-[10px] text-text-secondary font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search blocks by ID, variety, pit, location..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
            showFilters
              ? 'bg-navy text-white border-navy'
              : 'bg-surface text-text-primary border-border hover:border-border-hover'
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
          {(filters.category !== 'all' || filters.status !== 'all') && (
            <span className="w-2 h-2 rounded-full bg-teal" />
          )}
        </button>

        {/* View Toggle */}
        <div className="hidden sm:flex items-center border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'px-3 py-2.5 text-xs font-medium transition-colors',
              viewMode === 'grid' ? 'bg-navy text-white' : 'bg-surface text-text-secondary hover:bg-surface-hover'
            )}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'px-3 py-2.5 text-xs font-medium transition-colors',
              viewMode === 'table' ? 'bg-navy text-white' : 'bg-surface text-text-secondary hover:bg-surface-hover'
            )}
          >
            Table
          </button>
        </div>
      </motion.div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface rounded-xl border border-border p-4 flex flex-wrap gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Category</label>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => setFilters({ category: 'all' })}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      filters.category === 'all' ? 'bg-navy text-white' : 'bg-bg text-text-secondary hover:bg-navy-50'
                    )}
                  >
                    All
                  </button>
                  {Object.entries(BLOCK_CATEGORY_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFilters({ category: key as BlockCategory })}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        filters.category === key ? 'bg-navy text-white' : 'bg-bg text-text-secondary hover:bg-navy-50'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Status</label>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => setFilters({ status: 'all' })}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      filters.status === 'all' ? 'bg-navy text-white' : 'bg-bg text-text-secondary hover:bg-navy-50'
                    )}
                  >
                    All
                  </button>
                  {Object.entries(BLOCK_STATUS_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFilters({ status: key as BlockStatus })}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        filters.status === key ? 'bg-navy text-white' : 'bg-bg text-text-secondary hover:bg-navy-50'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear */}
              {(filters.category !== 'all' || filters.status !== 'all') && (
                <button
                  onClick={() => setFilters({ category: 'all', status: 'all' })}
                  className="self-end px-3 py-1.5 text-xs font-medium text-critical hover:bg-critical-bg rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div variants={itemVariants} className="bg-critical-bg border border-critical-border rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-critical shrink-0" />
          <p className="text-sm text-critical">{error}</p>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredBlocks.length === 0 && !loading && (
        <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-navy" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">No blocks found</h3>
          <p className="text-sm text-text-secondary mb-6">
            {blocks.length === 0
              ? 'Start by adding your first block production record.'
              : 'No blocks match your current filters.'}
          </p>
          {blocks.length === 0 && (
            <Link
              to="/production/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add First Block
            </Link>
          )}
        </motion.div>
      )}

      {/* Block Grid */}
      {filteredBlocks.length > 0 && viewMode === 'grid' && (
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBlocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              onView={() => navigate(`/production/${block.id}`)}
              onEdit={() => navigate(`/production/${block.id}/edit`)}
              onDelete={() => setDeleteConfirm(block.id)}
            />
          ))}
        </motion.div>
      )}

      {/* Block Table */}
      {filteredBlocks.length > 0 && viewMode === 'table' && (
        <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Block ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Variety</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Pit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Dimensions</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary">CBM</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBlocks.map((block) => (
                  <tr key={block.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 font-semibold text-navy">{block.blockId}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium border', categoryColors[block.category] || 'bg-gray-50')}>
                        {BLOCK_CATEGORY_LABELS[block.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-primary">{block.graniteVariety}</td>
                    <td className="px-4 py-3 text-text-secondary">{block.pit}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {block.dimensions.length}×{block.dimensions.width}×{block.dimensions.height} cm
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{block.cbm.toFixed(3)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium border', getStatusColor(block.status))}>
                        {BLOCK_STATUS_LABELS[block.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/production/${block.id}`)} className="p-1.5 rounded-lg hover:bg-navy-50 text-text-tertiary hover:text-navy transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/production/${block.id}/edit`)} className="p-1.5 rounded-lg hover:bg-teal-50 text-text-tertiary hover:text-teal transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(block.id)} className="p-1.5 rounded-lg hover:bg-critical-bg text-text-tertiary hover:text-critical transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Results count */}
      {filteredBlocks.length > 0 && (
        <p className="text-xs text-text-tertiary text-center">
          Showing {filteredBlocks.length} of {blocks.length} blocks
        </p>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-surface rounded-2xl border border-border shadow-xl p-6 z-50"
            >
              <div className="w-12 h-12 rounded-xl bg-critical-bg flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-critical" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary text-center mb-1">Delete Block?</h3>
              <p className="text-sm text-text-secondary text-center mb-6">
                This action cannot be undone. The block record will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 bg-bg border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2.5 bg-critical text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// BLOCK CARD COMPONENT
// ============================================
interface BlockCardProps {
  block: Block;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function BlockCard({ block, onView, onEdit, onDelete }: BlockCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-surface rounded-xl border border-border p-4 hover:shadow-md transition-shadow group cursor-pointer"
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-navy">{block.blockId}</p>
            <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-medium border', categoryColors[block.category] || 'bg-gray-50')}>
              {BLOCK_CATEGORY_LABELS[block.category]}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">{block.graniteVariety}</p>
        </div>
        <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-medium border', getStatusColor(block.status))}>
          {BLOCK_STATUS_LABELS[block.status]}
        </span>
      </div>

      {/* Photo thumbnail */}
      {block.photos && block.photos.length > 0 ? (
        <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-bg">
          <img
            src={block.photos[0]}
            alt={block.blockId}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-32 rounded-lg mb-3 bg-bg flex items-center justify-center">
          <Mountain className="w-8 h-8 text-text-tertiary" />
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-text-tertiary">Pit / Bench</p>
          <p className="font-medium text-text-primary">{block.pit} / {block.bench}</p>
        </div>
        <div>
          <p className="text-text-tertiary">Dimensions</p>
          <p className="font-medium text-text-primary">
            {block.dimensions.length}×{block.dimensions.width}×{block.dimensions.height}
          </p>
        </div>
        <div>
          <p className="text-text-tertiary">CBM</p>
          <p className="font-semibold text-teal">{block.cbm.toFixed(3)}</p>
        </div>
        <div>
          <p className="text-text-tertiary">Location</p>
          <p className="font-medium text-text-primary truncate">{block.currentLocation || '—'}</p>
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
