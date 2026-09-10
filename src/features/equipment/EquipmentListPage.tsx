// Benita Granites — Equipment List Page
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Loader2, Truck, Filter, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import type { Equipment } from '@/types';

const CATEGORIES = [
  'SANY',
  'TATA HITACHI',
  'TRACTORS',
  'GENERATORS',
  'SITE VEHICLES',
  'MANAGEMENT VEHICLES',
];

export default function EquipmentListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { equipment, loading, subscribe, cleanup } = useEquipmentStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.uid) subscribe(user.uid);
    return () => cleanup();
  }, [user?.uid]);

  const filtered = useMemo(() => {
    return equipment.filter(e => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return e.internalName.toLowerCase().includes(s) || 
               e.equipmentId.toLowerCase().includes(s) ||
               (e.operator || '').toLowerCase().includes(s);
      }
      return true;
    });
  }, [equipment, search, categoryFilter]);

  // Group by category for better display
  const grouped = useMemo(() => {
    const groups: Record<string, Equipment[]> = {};
    CATEGORIES.forEach(c => groups[c] = []);
    filtered.forEach(e => {
      if (!groups[e.category]) groups[e.category] = [];
      groups[e.category].push(e);
    });
    return groups;
  }, [filtered]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">Equipment Master</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage all vehicles and machinery</p>
        </div>
        <Link to="/equipment/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-sm">
          <Plus className="w-4 h-4" /> Add Equipment
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {Object.entries(grouped).map(([category, items]) => {
        if (items.length === 0) return null;
        return (
          <div key={category} className="space-y-3">
            <h2 className="text-sm font-bold text-navy flex items-center gap-2">
              <Truck className="w-4 h-4 text-teal" /> {category} ({items.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(item => (
                <div key={item.id} onClick={() => navigate(`/equipment/${item.id}/edit`)} className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-navy">{item.internalName}</p>
                      {category === 'MANAGEMENT VEHICLES' ? (
                        <p className="text-xs text-text-tertiary flex items-center gap-1 mt-1">
                          <Shield className="w-3 h-3" /> Confidential
                        </p>
                      ) : (
                        <p className="text-xs text-text-secondary mt-0.5">{item.equipmentId} • {item.operator}</p>
                      )}
                    </div>
                    <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-medium border', 
                      item.status === 'active' ? 'bg-success-bg text-success border-success-border' : 
                      item.status === 'under_maintenance' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-gray-100 text-gray-500 border-gray-200'
                    )}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                    <div>
                      <p className="text-text-tertiary">Current Hours</p>
                      <p className="font-semibold text-text-primary">{item.hourMeter.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-text-tertiary">Fuel Type</p>
                      <p className="font-semibold text-text-primary capitalize">{item.fuelType}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <Truck className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-50" />
          <p className="text-text-secondary font-medium">No equipment found.</p>
        </div>
      )}
    </motion.div>
  );
}
