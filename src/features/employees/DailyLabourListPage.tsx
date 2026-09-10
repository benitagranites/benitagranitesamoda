// Benita Granites — Daily Labour List Page
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Loader2, Users, Calendar, BarChart3 } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useEmployeeStore } from '@/stores/employeeStore';

export default function DailyLabourListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { dailyLabour, loading, subscribe, cleanup } = useEmployeeStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.uid) subscribe(user.uid);
    return () => cleanup();
  }, [user?.uid]);

  const filtered = useMemo(() => {
    if (!search) return dailyLabour;
    const s = search.toLowerCase();
    return dailyLabour.filter(l => 
      l.category.toLowerCase().includes(s) || 
      l.work.toLowerCase().includes(s)
    );
  }, [dailyLabour, search]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Get beginning of current week (Monday)
    const currentDay = now.getDay() || 7; // Convert Sun (0) to 7
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    let dailyTotal = 0;
    let weeklyTotal = 0;
    let monthlyTotal = 0;
    let todayPersons = 0;

    dailyLabour.forEach(l => {
      const d = l.date?.toDate?.();
      if (!d) return;

      const dateStr = d.toISOString().split('T')[0];
      const amount = l.amount;

      // Daily
      if (dateStr === todayStr) {
        dailyTotal += amount;
        todayPersons += l.persons;
      }
      
      // Weekly
      if (d >= startOfWeek && d <= now) {
        weeklyTotal += amount;
      }

      // Monthly
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        monthlyTotal += amount;
      }
    });

    return { dailyTotal, weeklyTotal, monthlyTotal, todayPersons };
  }, [dailyLabour]);

  // Group today's entries by date to show date-wise blocks
  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof dailyLabour> = {};
    filtered.forEach(l => {
      const d = l.date?.toDate?.();
      if (!d) return;
      const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(l);
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
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">Daily Labour</h1>
          <p className="text-sm text-text-secondary mt-0.5">Track daily wage workers and costs</p>
        </div>
        <div className="flex gap-2">
          <Link to="/employees" className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-navy rounded-xl text-sm font-semibold hover:bg-surface-hover transition-colors">
            View Permanent Staff
          </Link>
          <Link to="/labour/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-sm">
            <Plus className="w-4 h-4" /> Add Labour Entry
          </Link>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center mb-3">
            <Users className="w-4 h-4 text-teal" />
          </div>
          <p className="text-2xl font-bold text-navy">{stats.todayPersons}</p>
          <p className="text-[11px] text-text-secondary font-medium">Persons (Today)</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-info-bg flex items-center justify-center mb-3">
            <Calendar className="w-4 h-4 text-info" />
          </div>
          <p className="text-2xl font-bold text-navy">{formatINR(stats.dailyTotal)}</p>
          <p className="text-[11px] text-text-secondary font-medium">Daily Cost (Today)</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <BarChart3 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-navy">{formatINR(stats.weeklyTotal)}</p>
          <p className="text-[11px] text-text-secondary font-medium">Weekly Cost (This Week)</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mb-3">
            <BarChart3 className="w-4 h-4 text-slate-blue" />
          </div>
          <p className="text-2xl font-bold text-navy">{formatINR(stats.monthlyTotal)}</p>
          <p className="text-[11px] text-text-secondary font-medium">Monthly Cost (This Month)</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="Search category or work..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
        />
      </div>

      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, entries]) => {
          const dateTotal = entries.reduce((sum, e) => sum + e.amount, 0);
          
          return (
            <div key={date} className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="bg-bg border-b border-border px-4 py-3 flex justify-between items-center">
                <h3 className="font-bold text-navy flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal" /> {date}
                </h3>
                <span className="text-sm font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  Total: {formatINR(dateTotal)}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-surface text-xs text-text-secondary font-semibold uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Work</th>
                      <th className="px-4 py-3">Persons</th>
                      <th className="px-4 py-3">Rate</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-navy">{entry.category}</td>
                        <td className="px-4 py-3 text-text-secondary">{entry.work || '—'}</td>
                        <td className="px-4 py-3 font-medium">{entry.persons}</td>
                        <td className="px-4 py-3 text-text-secondary">{formatINR(entry.rate)}</td>
                        <td className="px-4 py-3 font-bold text-navy text-right">{formatINR(entry.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {Object.keys(groupedByDate).length === 0 && (
          <div className="text-center py-12 bg-surface rounded-xl border border-border">
            <Users className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-50" />
            <p className="text-text-secondary font-medium">No daily labour records found.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
