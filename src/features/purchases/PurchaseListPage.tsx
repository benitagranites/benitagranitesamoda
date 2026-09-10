// Benita Granites — Purchase List Page
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Loader2, Receipt, Image as ImageIcon, CreditCard } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { usePurchaseStore } from '@/stores/purchaseStore';

const CATEGORIES = ['All', 'Fuel', 'Machinery', 'Mine Operations', 'Office', 'Kitchen', 'Other'];

export default function PurchaseListPage() {
  const { user } = useAuthStore();
  const { purchases, loading, subscribe, cleanup } = usePurchaseStore();
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    if (user?.uid) subscribe(user.uid);
    return () => cleanup();
  }, [user?.uid]);

  const filtered = useMemo(() => {
    return purchases.filter(p => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return p.supplier.toLowerCase().includes(s) || 
               p.item.toLowerCase().includes(s) ||
               p.invoiceNumber.toLowerCase().includes(s);
      }
      return true;
    });
  }, [purchases, search, categoryFilter]);

  const stats = useMemo(() => {
    const totalAmount = filtered.reduce((acc, p) => acc + p.total, 0);
    const pendingAmount = filtered.filter(p => p.paymentStatus === 'pending').reduce((acc, p) => acc + p.total, 0);
    return { totalAmount, pendingAmount };
  }, [filtered]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">Purchase Register</h1>
          <p className="text-sm text-text-secondary mt-0.5">Track all site purchases and materials</p>
        </div>
        <Link to="/purchases/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-sm">
          <Plus className="w-4 h-4" /> Add Purchase
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6 text-teal" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{formatINR(stats.totalAmount)}</p>
            <p className="text-[11px] text-text-secondary font-medium">Total Spend (Filtered)</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{formatINR(stats.pendingAmount)}</p>
            <p className="text-[11px] text-text-secondary font-medium">Pending Payments</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search supplier, item, or invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all outline-none min-w-[200px]"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg border-b border-border text-xs text-text-secondary font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Date & Inv</th>
                <th className="px-4 py-3">Supplier & Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-4 py-3 text-center">Payment</th>
                <th className="px-4 py-3 text-center">Bill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">
                      {purchase.date?.toDate?.().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-text-secondary">{purchase.invoiceNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-navy truncate max-w-[200px]">{purchase.supplier}</p>
                    <p className="text-xs text-text-secondary truncate max-w-[200px]">{purchase.item}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{purchase.category}</td>
                  <td className="px-4 py-3 font-medium">{purchase.quantity} <span className="text-[10px] text-text-tertiary">{purchase.unit}</span></td>
                  <td className="px-4 py-3 text-text-secondary">{formatINR(purchase.rate)}</td>
                  <td className="px-4 py-3 font-bold text-navy text-right">{formatINR(purchase.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border', 
                      purchase.paymentStatus === 'paid' ? 'bg-success-bg text-success border-success-border' : 
                      'bg-amber-50 text-amber-700 border-amber-200'
                    )}>
                      {purchase.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {purchase.billPhoto ? (
                      <a href={purchase.billPhoto} target="_blank" rel="noreferrer" className="inline-flex p-1.5 text-teal bg-teal-50 rounded-md hover:bg-teal-100 transition-colors">
                        <ImageIcon className="w-4 h-4" />
                      </a>
                    ) : <span className="text-text-tertiary text-xs">—</span>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-secondary">
                    No purchases found for the selected filters.
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
