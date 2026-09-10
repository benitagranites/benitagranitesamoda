// Benita Granites — Employee Master List
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Loader2, Users, Briefcase, Calculator, Building2 } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useEmployeeStore } from '@/stores/employeeStore';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { employees, loading, subscribe, cleanup } = useEmployeeStore();
  const [search, setSearch] = useState('');
  const [showSalaryProcessing, setShowSalaryProcessing] = useState(false);

  useEffect(() => {
    if (user?.uid) subscribe(user.uid);
    return () => cleanup();
  }, [user?.uid]);

  const filtered = useMemo(() => {
    if (!search) return employees;
    const s = search.toLowerCase();
    return employees.filter(e => 
      e.name.toLowerCase().includes(s) || 
      e.employeeId.toLowerCase().includes(s) ||
      e.department.toLowerCase().includes(s)
    );
  }, [employees, search]);

  const stats = useMemo(() => {
    const active = employees.filter(e => e.isActive);
    const totalSalary = active.reduce((sum, e) => sum + e.monthlySalary, 0);
    return { activeCount: active.length, totalSalary };
  }, [employees]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">Permanent Employees</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage staff master data and monthly salaries</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSalaryProcessing(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-sm font-semibold hover:bg-teal-100 transition-colors"
          >
            <Calculator className="w-4 h-4" /> Process Salary
          </button>
          <Link to="/employees/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-800 shadow-sm">
            <Plus className="w-4 h-4" /> Add Employee
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-navy" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{stats.activeCount}</p>
            <p className="text-[11px] text-text-secondary font-medium">Active Employees</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6 text-teal" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{formatINR(stats.totalSalary)}</p>
            <p className="text-[11px] text-text-secondary font-medium">Monthly Payroll Run</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="Search by name, ID, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(emp => (
          <div key={emp.id} onClick={() => navigate(`/employees/${emp.id}/edit`)} className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-navy">{emp.name}</p>
                <p className="text-xs text-text-secondary mt-0.5">{emp.employeeId} • {emp.designation}</p>
              </div>
              <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-medium border', 
                emp.isActive ? 'bg-success-bg text-success border-success-border' : 'bg-gray-100 text-gray-500 border-gray-200'
              )}>
                {emp.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700">
                <Building2 className="w-3 h-3" /> {emp.department}
              </span>
            </div>

            <div className="pt-3 border-t border-border flex justify-between items-center">
              <p className="text-xs text-text-tertiary">Monthly Salary</p>
              <p className="font-bold text-navy">{formatINR(emp.monthlySalary)}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <Users className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-50" />
          <p className="text-text-secondary font-medium">No employees found.</p>
        </div>
      )}

      {/* Salary Processing Modal */}
      <AnimatePresence>
        {showSalaryProcessing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowSalaryProcessing(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface rounded-2xl border border-border shadow-xl p-6 z-50">
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-navy">Monthly Salary Processing</h2>
                  <p className="text-sm text-text-secondary">Summary of all active permanent employees</p>
                </div>
                <div className="bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl text-right">
                  <p className="text-[10px] text-teal-800 font-bold uppercase tracking-wider mb-0.5">Total Payroll</p>
                  <p className="text-xl font-black text-teal">{formatINR(stats.totalSalary)}</p>
                </div>
              </div>

              <div className="bg-white border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bg border-b border-border">
                    <tr>
                      <th className="px-4 py-2 font-medium text-text-secondary">Employee</th>
                      <th className="px-4 py-2 font-medium text-text-secondary text-right">Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {employees.filter(e => e.isActive).map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-navy">{emp.name}</p>
                          <p className="text-[10px] text-text-tertiary">{emp.employeeId} • {emp.designation}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-navy">
                          {formatINR(emp.monthlySalary)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-navy-50 border-t-2 border-navy-100">
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy text-right">Total:</td>
                      <td className="px-4 py-3 font-black text-navy text-right">{formatINR(stats.totalSalary)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowSalaryProcessing(false)} className="px-5 py-2.5 bg-bg border border-border rounded-xl text-sm font-medium">Close</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
