// Benita Granites — Tractor Rent List Page
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Loader2, Tractor, Activity, CreditCard } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useTractorRentStore } from '@/stores/tractorRentStore';

export default function TractorRentListPage() {
  const { user } = useAuthStore();
  const { rentals, loading, subscribe, cleanup } = useTractorRentStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.uid) subscribe(user.uid);
    return () => cleanup();
  }, [user?.uid]);

  const filtered = useMemo(() => {
    if (!search) return rentals;
    const s = search.toLowerCase();
    return rentals.filter(r => 
      r.tractorId.toLowerCase().includes(s) || 
      r.owner.toLowerCase().includes(s) ||
      r.workPerformed.toLowerCase().includes(s)
    );
  }, [rentals, search]);

  const stats = useMemo(() => {
    const totalAmount = rentals.reduce((sum, r) => sum + r.amount, 0);
    const totalHoles = rentals.reduce((sum, r) => sum + r.holesdrilled, 0);
    const avgCostPerHole = totalHoles > 0 ? totalAmount / totalHoles : 0;
    const pendingPayments = rentals.filter(r => r.paymentStatus === 'pending').length;

    return { totalAmount, totalHoles, avgCostPerHole, pendingPayments };
  }, [rentals]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">Tractor Rental</h1>
          <p className="text-sm text-text-secondary mt-0.5">Track external tractors, drilling work, and cost per hole</p>
        </div>
        <Link to="/tractor-rent/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-sm">
          <Plus className="w-4 h-4" /> Add Rental Work
        </Link>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center mb-3">
            <Tractor className="w-4 h-4 text-teal" />
          </div>
          <p className="text-2xl font-bold text-navy">{formatINR(stats.totalAmount)}</p>
          <p className="text-[11px] text-text-secondary font-medium">Total Amount Payable</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mb-3">
            <Activity className="w-4 h-4 text-slate-blue" />
          </div>
          <p className="text-2xl font-bold text-navy">{stats.totalHoles.toLocaleString()}</p>
          <p className="text-[11px] text-text-secondary font-medium">Total Holes Drilled</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-info-bg flex items-center justify-center mb-3">
            <span className="text-info font-bold text-xs">KPI</span>
          </div>
          <p className="text-2xl font-bold text-navy">{formatINR(stats.avgCostPerHole)}</p>
          <p className="text-[11px] text-text-secondary font-medium">Avg Cost / Drilling Hole</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-navy">{stats.pendingPayments}</p>
          <p className="text-[11px] text-text-secondary font-medium">Pending Payments</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="Search by tractor, owner, or work..."
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
                <th className="px-4 py-3">Tractor / Owner</th>
                <th className="px-4 py-3">Work Performed</th>
                <th className="px-4 py-3">Holes Drilled</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Cost / Hole</th>
                <th className="px-4 py-3">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((rental) => (
                <tr key={rental.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-text-primary font-medium">
                    {rental.date?.toDate?.().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">{rental.tractorId}</p>
                    <p className="text-[10px] text-text-secondary">{rental.owner}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{rental.workPerformed}</td>
                  <td className="px-4 py-3 font-semibold">{rental.holesdrilled || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatINR(rental.rate)}</td>
                  <td className="px-4 py-3 font-bold text-navy">{formatINR(rental.amount)}</td>
                  <td className="px-4 py-3">
                    {rental.holesdrilled > 0 ? (
                      <span className="inline-flex px-2 py-1 bg-teal-50 text-teal-800 rounded-md font-semibold text-xs border border-teal-200">
                        {formatINR(rental.costPerHole)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border', 
                      rental.paymentStatus === 'paid' ? 'bg-success-bg text-success border-success-border' : 
                      'bg-amber-50 text-amber-700 border-amber-200'
                    )}>
                      {rental.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-secondary">
                    No rental records found.
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
