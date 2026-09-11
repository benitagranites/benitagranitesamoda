// Benita Granites — Fuel List Page
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Loader2, Fuel, TrendingDown, Gauge } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useFuelStore } from '@/stores/fuelStore';
import { useEquipmentStore } from '@/stores/equipmentStore';

export default function FuelListPage() {
  const { user } = useAuthStore();
  const { entries, loading, subscribe, cleanup } = useFuelStore();
  const { equipment, subscribe: subscribeEq, cleanup: cleanupEq } = useEquipmentStore();
  
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.uid) {
      subscribe(user.uid);
      subscribeEq(user.uid);
    }
    return () => {
      cleanup();
      cleanupEq();
    };
  }, [user?.uid]);

  const eqMap = useMemo(() => {
    return equipment.reduce((acc, eq) => {
      acc[eq.id] = eq;
      return acc;
    }, {} as Record<string, typeof equipment[0]>);
  }, [equipment]);

  const filtered = useMemo(() => {
    if (!search) return entries;
    const s = search.toLowerCase();
    return entries.filter(e => {
      const eq = eqMap[e.equipmentId];
      return (eq?.internalName || '').toLowerCase().includes(s) || 
             (eq?.equipmentId || '').toLowerCase().includes(s);
    });
  }, [entries, search, eqMap]);

  const stats = useMemo(() => {
    const totalLitres = entries.reduce((acc, e) => acc + e.dieselFilled, 0);
    const totalCost = entries.reduce((acc, e) => acc + e.totalCost, 0);
    const avgRate = totalLitres > 0 ? totalCost / totalLitres : 0;
    
    // Calculate global efficiency (sum of all litres / sum of all hours used)
    const validEntries = entries.filter(e => e.hoursUsed > 0);
    const sumLitres = validEntries.reduce((acc, e) => acc + e.dieselFilled, 0);
    const sumHours = validEntries.reduce((acc, e) => acc + e.hoursUsed, 0);
    const avgEfficiency = sumHours > 0 ? sumLitres / sumHours : 0;

    return { totalLitres, totalCost, avgRate, avgEfficiency };
  }, [entries]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">Fuel & Diesel Tracking</h1>
          <p className="text-sm text-text-secondary mt-0.5">Track daily fuel consumption and efficiency</p>
        </div>
        <Link to="/fuel/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-sm">
          <Plus className="w-4 h-4" /> Add Fuel Entry
        </Link>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center mb-3">
            <Fuel className="w-4 h-4 text-teal" />
          </div>
          <p className="text-2xl font-bold text-navy">{stats.totalLitres.toLocaleString()} L</p>
          <p className="text-[11px] text-text-secondary font-medium">Total Diesel Filled</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mb-3">
            <TrendingDown className="w-4 h-4 text-slate-blue" />
          </div>
          <p className="text-2xl font-bold text-navy">{formatINR(stats.totalCost)}</p>
          <p className="text-[11px] text-text-secondary font-medium">Total Fuel Cost</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <Fuel className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-navy">{formatINR(stats.avgRate)}</p>
          <p className="text-[11px] text-text-secondary font-medium">Average Rate per Litre</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-info-bg flex items-center justify-center mb-3">
            <Gauge className="w-4 h-4 text-info" />
          </div>
          <p className="text-2xl font-bold text-navy">{stats.avgEfficiency.toFixed(1)} L/Hr</p>
          <p className="text-[11px] text-text-secondary font-medium">Fleet Avg Efficiency</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="Search by vehicle name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
        />
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg border-b border-border text-xs text-text-secondary font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Hours Used</th>
                <th className="px-4 py-3">Diesel (L)</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Total Cost</th>
                <th className="px-4 py-3">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((entry) => {
                const eq = eqMap[entry.equipmentId];
                return (
                  <tr key={entry.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {entry.date?.toDate?.().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">{eq?.internalName || 'Unknown'}</p>
                      <p className="text-[10px] text-text-secondary">{eq?.equipmentId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{entry.hoursUsed} hrs</p>
                      <p className="text-[10px] text-text-tertiary">{entry.openingHour} → {entry.closingHour}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-teal">{entry.dieselFilled} L</td>
                    <td className="px-4 py-3 text-text-secondary">{formatINR(entry.ratePerLitre)}</td>
                    <td className="px-4 py-3 font-bold text-navy">{formatINR(entry.totalCost)}</td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-info-bg border border-info-border text-info text-xs font-semibold">
                        <Gauge className="w-3 h-3" />
                        {entry.efficiency.toFixed(1)} L/Hr
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                    No fuel entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
