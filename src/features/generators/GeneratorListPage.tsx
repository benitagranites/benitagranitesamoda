// Benita Granites — Generator List Page
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Loader2, Zap, TrendingDown, Clock, Download } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useGeneratorStore } from '@/stores/generatorStore';

export default function GeneratorListPage() {
  const { user } = useAuthStore();
  const { entries, loading, subscribe, cleanup } = useGeneratorStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.uid) subscribe(user.uid);
    return () => cleanup();
  }, [user?.uid]);

  const filtered = useMemo(() => {
    if (!search) return entries;
    const s = search.toLowerCase();
    return entries.filter(e => e.generatorId.toLowerCase().includes(s));
  }, [entries, search]);

  const stats = useMemo(() => {
    // Current month filter
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthEntries = entries.filter(e => {
      const d = e.date?.toDate?.();
      if (!d) return false;
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalLitresThisMonth = thisMonthEntries.reduce((acc, e) => acc + e.dieselLitres, 0);
    const totalCostThisMonth = thisMonthEntries.reduce((acc, e) => acc + e.dieselCost, 0);
    const totalHoursThisMonth = thisMonthEntries.reduce((acc, e) => acc + e.runningHours, 0);

    // Group by Generator ID for monthly consumption
    const consumptionByGen: Record<string, number> = {};
    thisMonthEntries.forEach(e => {
      if (!consumptionByGen[e.generatorId]) consumptionByGen[e.generatorId] = 0;
      consumptionByGen[e.generatorId] += e.dieselLitres;
    });

    return { 
      totalLitresThisMonth, 
      totalCostThisMonth, 
      totalHoursThisMonth,
      consumptionByGen
    };
  }, [entries]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">Generator Tracker</h1>
          <p className="text-sm text-text-secondary mt-0.5">Track DG fuel consumption and running hours</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-hover">
            <Download className="w-4 h-4" />
          </button>
          <Link to="/generators/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-sm">
            <Plus className="w-4 h-4" /> Log DG Fuel
          </Link>
        </div>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center mb-3">
            <Zap className="w-4 h-4 text-teal" />
          </div>
          <p className="text-2xl font-bold text-navy">{stats.totalLitresThisMonth.toLocaleString()} L</p>
          <p className="text-[11px] text-text-secondary font-medium">Diesel Consumed (This Month)</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-navy">{stats.totalHoursThisMonth.toFixed(1)} Hrs</p>
          <p className="text-[11px] text-text-secondary font-medium">Running Hours (This Month)</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mb-3">
            <TrendingDown className="w-4 h-4 text-slate-blue" />
          </div>
          <p className="text-2xl font-bold text-navy">{formatINR(stats.totalCostThisMonth)}</p>
          <p className="text-[11px] text-text-secondary font-medium">Total Cost (This Month)</p>
        </div>
      </div>

      {/* Monthly Consumption by Generator */}
      {Object.keys(stats.consumptionByGen).length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-teal-900 mb-3">Monthly Consumption Summary</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.consumptionByGen).map(([genId, litres]) => (
              <div key={genId} className="bg-white border border-teal-100 rounded-lg px-4 py-2 shadow-sm">
                <span className="font-bold text-navy mr-2">{genId}</span>
                <span className="text-sm font-medium text-text-secondary">consumed</span>
                <span className="font-bold text-teal mx-2">{litres} litres</span>
                <span className="text-sm font-medium text-text-secondary">this month</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="Search by Generator ID..."
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
                <th className="px-4 py-3">Generator</th>
                <th className="px-4 py-3">Running Hours</th>
                <th className="px-4 py-3">Diesel (L)</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Load Info</th>
                <th className="px-4 py-3">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-text-primary font-medium">
                    {entry.date?.toDate?.().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 font-bold text-navy">{entry.generatorId}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{entry.runningHours.toFixed(1)} hrs</span>
                    <span className="text-[10px] text-text-tertiary ml-2">({entry.openingHour} → {entry.closingHour})</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-teal">{entry.dieselLitres} L</td>
                  <td className="px-4 py-3 text-text-secondary">{formatINR(entry.dieselCost)}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{entry.load || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{entry.operator}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                    No generator records found.
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
