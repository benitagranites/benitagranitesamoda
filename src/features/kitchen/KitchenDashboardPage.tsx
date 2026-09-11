// Benita Granites — Kitchen Dashboard
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Loader2, ChefHat, Coffee, ShoppingBag, Users } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useKitchenStore } from '@/stores/kitchenStore';
import { usePurchaseStore } from '@/stores/purchaseStore';

export default function KitchenDashboardPage() {
  const { user } = useAuthStore();
  const { entries, staff, loading: kLoading, subscribe: kSub, cleanup: kClean } = useKitchenStore();
  const { purchases, loading: pLoading, subscribe: pSub, cleanup: pClean } = usePurchaseStore();

  useEffect(() => {
    if (user?.uid) {
      kSub(user.uid);
      pSub(user.uid);
    }
    return () => {
      kClean();
      pClean();
    };
  }, [user?.uid]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Kitchen Daily Entries (Food/Tea Cost)
    const monthEntries = entries.filter(e => {
      const d = e.date?.toDate?.();
      return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    let totalMealsServed = 0;
    let dailyFoodCost = 0;
    
    monthEntries.forEach(e => {
      totalMealsServed += e.breakfast.served + e.lunch.served + e.eveningTea.served + e.dinner.served;
      dailyFoodCost += e.totalCost;
    });

    // 2. Kitchen Purchases (from Purchase Register)
    const monthPurchases = purchases.filter(p => {
      if (p.category !== 'Kitchen') return false;
      const d = p.date?.toDate?.();
      return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const groceryCost = monthPurchases.reduce((sum, p) => sum + p.total, 0);

    // 3. Kitchen Staff Salary
    const staffSalary = staff.filter(s => s.isActive).reduce((sum, s) => sum + s.monthlySalary, 0);

    // Final Calculation
    const totalMonthlyCost = dailyFoodCost + groceryCost + staffSalary;
    
    // Cost per employee per day
    // A full day for 1 employee might consist of Breakfast, Lunch, Tea, Dinner (4 "meals" or servings).
    // Or we could divide by total distinct days * average employees.
    // Let's use simple logic: Total Cost / Total Meals Served * 3 (assuming 3 main meals a day is 1 employee day equivalent)
    const costPerEmployeePerDay = totalMealsServed > 0 
      ? (totalMonthlyCost / totalMealsServed) * 3 
      : 0;

    return { 
      dailyFoodCost, 
      groceryCost, 
      staffSalary, 
      totalMonthlyCost, 
      totalMealsServed,
      costPerEmployeePerDay,
      monthPurchases
    };
  }, [entries, purchases, staff]);

  if (kLoading || pLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">Kitchen & Food</h1>
          <p className="text-sm text-text-secondary mt-0.5">Employee food cost analysis</p>
        </div>
        <div className="flex gap-2">
          <Link to="/kitchen/staff" className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-navy rounded-xl text-sm font-semibold hover:bg-surface-hover transition-colors">
            <Users className="w-4 h-4" /> Manage Staff
          </Link>
          <Link to="/kitchen/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-sm">
            <Plus className="w-4 h-4" /> Daily Food Entry
          </Link>
        </div>
      </div>

      {/* Main KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-navy rounded-xl p-5 text-white lg:col-span-2 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-navy-200 font-medium text-sm mb-1 uppercase tracking-wider">Total Kitchen Cost (This Month)</p>
            <p className="text-4xl font-black">{formatINR(stats.totalMonthlyCost)}</p>
            
            <div className="flex items-center gap-6 mt-6">
              <div>
                <p className="text-navy-300 text-[10px] uppercase">Daily Purchases</p>
                <p className="font-semibold text-sm">{formatINR(stats.dailyFoodCost)}</p>
              </div>
              <div>
                <p className="text-navy-300 text-[10px] uppercase">Grocery Stock</p>
                <p className="font-semibold text-sm">{formatINR(stats.groceryCost)}</p>
              </div>
              <div>
                <p className="text-navy-300 text-[10px] uppercase">Cook Salary</p>
                <p className="font-semibold text-sm">{formatINR(stats.staffSalary)}</p>
              </div>
            </div>
          </div>
          <ChefHat className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5" />
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 flex flex-col justify-center">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center mb-3">
            <span className="text-teal font-bold text-xs">KPI</span>
          </div>
          <p className="text-3xl font-black text-navy">{formatINR(stats.costPerEmployeePerDay)}</p>
          <p className="text-xs text-text-secondary font-medium mt-1">Cost / Employee / Day</p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 flex flex-col justify-center">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <Coffee className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-navy">{stats.totalMealsServed}</p>
          <p className="text-xs text-text-secondary font-medium mt-1">Total Servings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily Entries List */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-bg">
            <h3 className="font-bold text-navy flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-teal" /> Daily Meal Logs
            </h3>
          </div>
          <div className="p-0 overflow-y-auto max-h-[400px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface text-xs text-text-secondary font-semibold uppercase tracking-wider sticky top-0 border-b border-border">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Servings</th>
                  <th className="px-4 py-3 text-right">Cost (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-navy">
                      {e.date?.toDate?.().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {e.breakfast.served + e.lunch.served + e.eveningTea.served + e.dinner.served} total
                    </td>
                    <td className="px-4 py-3 font-bold text-navy text-right">{formatINR(e.totalCost)}</td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-text-tertiary">No entries yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grocery Purchases List */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-bg flex justify-between items-center">
            <h3 className="font-bold text-navy flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-600" /> Kitchen Groceries
            </h3>
            <Link to="/purchases" className="text-xs font-semibold text-teal hover:underline">View All</Link>
          </div>
          <div className="p-0 overflow-y-auto max-h-[400px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface text-xs text-text-secondary font-semibold uppercase tracking-wider sticky top-0 border-b border-border">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.monthPurchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-text-secondary">
                      {p.date?.toDate?.().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy truncate max-w-[150px]">{p.item}</p>
                      <p className="text-[10px] text-text-tertiary">{p.supplier}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-navy text-right">{formatINR(p.total)}</td>
                  </tr>
                ))}
                {stats.monthPurchases.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-text-tertiary">No kitchen purchases this month.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
