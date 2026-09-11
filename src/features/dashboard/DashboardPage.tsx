// Benita Granites — Management Dashboard
import { motion } from 'framer-motion';
import {
  Mountain, Fuel, Users, ChefHat, Receipt, CreditCard,
  TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Calendar,
  BarChart3, Shield, Truck, Activity,
} from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_HIERARCHY } from '@/constants';
import type { UserRole } from '@/constants';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { format } from 'date-fns';

// ============================================
// SAMPLE DATA (will be replaced with Firestore)
// ============================================
const productionData = [
  { month: 'Apr', gangSaw: 42, cutter: 55, commercial: 38 },
  { month: 'May', gangSaw: 38, cutter: 48, commercial: 42 },
  { month: 'Jun', gangSaw: 45, cutter: 52, commercial: 35 },
  { month: 'Jul', gangSaw: 50, cutter: 60, commercial: 40 },
  { month: 'Aug', gangSaw: 48, cutter: 58, commercial: 45 },
  { month: 'Sep', gangSaw: 44, cutter: 53, commercial: 41 },
];

const expenseTrend = [
  { month: 'Apr', amount: 2850000 },
  { month: 'May', amount: 3120000 },
  { month: 'Jun', amount: 2960000 },
  { month: 'Jul', amount: 3250000 },
  { month: 'Aug', amount: 3100000 },
  { month: 'Sep', amount: 3050000 },
];

const costCentreData = [
  { name: 'Fuel', value: 1280000, color: '#0F2747' },
  { name: 'Labour', value: 850000, color: '#334E68' },
  { name: 'Kitchen', value: 280000, color: '#0F766E' },
  { name: 'Purchases', value: 420000, color: '#2563EB' },
  { name: 'Maintenance', value: 320000, color: '#D97706' },
  { name: 'Other', value: 200000, color: '#64748B' },
];

const fuelConsumptionData = [
  { name: 'SANY-01', consumption: 14.2, benchmark: 12 },
  { name: 'SANY-02', consumption: 11.8, benchmark: 12 },
  { name: 'DG-01', consumption: 9.5, benchmark: 10 },
  { name: 'DG-02', consumption: 12.5, benchmark: 10 },
  { name: 'HITACHI-01', consumption: 15.1, benchmark: 14 },
];

// ============================================
// ANIMATION VARIANTS
// ============================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

// ============================================
// KPI CARD COMPONENT
// ============================================
interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accent?: 'navy' | 'teal' | 'slate';
  className?: string;
}

function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, accent = 'navy', className }: KPICardProps) {
  const accentColors = {
    navy: 'bg-navy-50 text-navy',
    teal: 'bg-teal-50 text-teal',
    slate: 'bg-slate-blue-50 text-slate-blue',
  };

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'bg-surface rounded-xl border border-border p-4 sm:p-5 hover:shadow-md transition-shadow cursor-pointer group',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', accentColors[accent])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            trend === 'up' && 'bg-success-bg text-success',
            trend === 'down' && 'bg-critical-bg text-critical',
            trend === 'neutral' && 'bg-slate-50 text-slate-500'
          )}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-text-primary mt-1 tracking-tight">{value}</p>
      {subtitle && <p className="text-xs text-text-tertiary mt-1">{subtitle}</p>}
    </motion.div>
  );
}

// ============================================
// EXCEPTION CARD COMPONENT
// ============================================
interface ExceptionItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  severity: 'critical' | 'warning';
  time: string;
}

const exceptions: ExceptionItem[] = [
  { id: '1', icon: Fuel, title: 'High Fuel Consumption', description: 'SANY-01: 14.2 L/hr (Normal: 10-12 L/hr)', severity: 'critical', time: '2h ago' },
  { id: '2', icon: AlertTriangle, title: 'Missing Fuel Photo', description: 'DG-02: Closing reading photo missing', severity: 'warning', time: '3h ago' },
  { id: '3', icon: Activity, title: 'Generator Reading Missing', description: 'DG-03: No reading submitted today', severity: 'critical', time: '5h ago' },
  { id: '4', icon: Shield, title: 'Security Handover Pending', description: 'Evening shift handover not confirmed', severity: 'warning', time: '6h ago' },
  { id: '5', icon: CreditCard, title: 'Payment Approval Overdue', description: '3 payments pending >48 hours', severity: 'critical', time: '1d ago' },
];

// ============================================
// PIPELINE COMPONENT
// ============================================
const pipelineStages = [
  { label: 'Dug', count: 24, color: 'bg-info' },
  { label: 'Dressing Ready', count: 12, color: 'bg-warning' },
  { label: 'Dressing', count: 8, color: 'bg-teal' },
  { label: 'Sale Ready', count: 18, color: 'bg-success' },
  { label: 'Reserved', count: 6, color: 'bg-navy' },
  { label: 'Sold', count: 32, color: 'bg-slate-blue' },
  { label: 'Dispatched', count: 28, color: 'bg-text-tertiary' },
];

// ============================================
// QUICK ACTION COMPONENT
// ============================================
interface QuickAction {
  label: string;
  icon: React.ElementType;
  path: string;
  color: string;
  roles: number;
}

const quickActions: QuickAction[] = [
  { label: 'View Exceptions', icon: AlertTriangle, path: '/exceptions', color: 'bg-critical', roles: 80 },
  { label: 'View Reports', icon: BarChart3, path: '/reports', color: 'bg-navy', roles: 60 },
  { label: 'View Expenses', icon: Receipt, path: '/expenses', color: 'bg-slate-blue', roles: 50 },
  { label: 'Verify Fuel', icon: Fuel, path: '/fuel', color: 'bg-teal', roles: 40 },
  { label: 'Submit Fuel', icon: Fuel, path: '/fuel/new', color: 'bg-teal', roles: 15 },
  { label: 'Record Payment', icon: CreditCard, path: '/payments/new', color: 'bg-navy', roles: 60 },
];

// ============================================
// DASHBOARD PAGE
// ============================================
export default function DashboardPage() {
  const { profile } = useAuthStore();
  const currentDate = new Date();
  const userLevel = ROLE_HIERARCHY[profile?.role as UserRole] || 0;

  const filteredActions = quickActions.filter((a) => userLevel >= a.roles).slice(0, 4);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 lg:p-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">
            Management Dashboard
          </h1>
          <p className="text-sm text-text-secondary flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            {format(currentDate, 'MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary">
            Last updated: {format(currentDate, 'h:mm a')}
          </span>
        </div>
      </motion.div>

      {/* Quick Actions */}
      {filteredActions.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white whitespace-nowrap transition-all hover:opacity-90 active:scale-[0.97] shadow-sm',
                    action.color
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Production KPIs */}
      <div>
        <motion.h2 variants={itemVariants} className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Production
        </motion.h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard title="Blocks Produced" value="138" subtitle="This month" icon={Mountain} trend="up" trendValue="+8%" accent="navy" />
          <KPICard title="Gang Saw" value="44" subtitle="31.9% of total" icon={Mountain} accent="teal" />
          <KPICard title="Cutter" value="53" subtitle="38.4% of total" icon={Mountain} accent="slate" />
          <KPICard title="Commercial" value="41" subtitle="29.7% of total" icon={Mountain} accent="navy" />
        </div>
      </div>

      {/* Block Pipeline */}
      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-border p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Block Pipeline</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {pipelineStages.map((stage) => (
            <div key={stage.label} className="flex-1 min-w-[90px]">
              <div className="text-center">
                <div className={cn('w-full h-2 rounded-full mb-2 opacity-20', stage.color)}>
                  <div className={cn('h-full rounded-full', stage.color)} style={{ width: `${Math.min(100, (stage.count / 32) * 100)}%` }} />
                </div>
                <p className="text-lg font-bold text-text-primary">{stage.count}</p>
                <p className="text-[10px] text-text-secondary font-medium mt-0.5">{stage.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Production Trend */}
        <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Production Trend</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="gangSaw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F2747" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0F2747" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cutter" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                  }}
                />
                <Area type="monotone" dataKey="gangSaw" stroke="#0F2747" fill="url(#gangSaw)" strokeWidth={2} name="Gang Saw" />
                <Area type="monotone" dataKey="cutter" stroke="#0F766E" fill="url(#cutter)" strokeWidth={2} name="Cutter" />
                <Area type="monotone" dataKey="commercial" stroke="#334E68" fill="transparent" strokeWidth={2} strokeDasharray="5 5" name="Commercial" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Expense Trend */}
        <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Expense Trend</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(value: any) => [formatINR(value), 'Expense']}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                  }}
                />
                <Bar dataKey="amount" fill="#0F2747" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Expense & Fuel KPIs */}
      <div>
        <motion.h2 variants={itemVariants} className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Expenses & Fuel
        </motion.h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard title="Total Site Expense" value={formatINR(3050000)} subtitle="This month" icon={Receipt} trend="down" trendValue="-2.1%" accent="navy" />
          <KPICard title="Diesel Purchased" value="12,800 L" subtitle="₹13.56L" icon={Fuel} accent="teal" />
          <KPICard title="Labour Cost" value={formatINR(850000)} subtitle="45 workers" icon={Users} accent="slate" />
          <KPICard title="Kitchen Cost" value={formatINR(280000)} subtitle="₹187/person/day" icon={ChefHat} accent="teal" />
        </div>
      </div>

      {/* Cost Centre + Fuel Consumption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost Centre Distribution */}
        <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Cost Centre Distribution</h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costCentreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {costCentreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatINR(value), '']}
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 w-full">
              {costCentreData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-text-secondary">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-text-primary">{formatINR(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Fuel Consumption by Equipment */}
        <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-border p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Fuel Consumption (L/hr)</h3>
          <div className="space-y-3">
            {fuelConsumptionData.map((item) => {
              const isOver = item.consumption > item.benchmark;
              const percentage = (item.consumption / 20) * 100;
              const benchmarkPercent = (item.benchmark / 20) * 100;

              return (
                <div key={item.name} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-text-primary">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-xs font-bold',
                        isOver ? 'text-critical' : 'text-success'
                      )}>
                        {item.consumption} L/hr
                      </span>
                      {isOver && <AlertTriangle className="w-3 h-3 text-critical" />}
                    </div>
                  </div>
                  <div className="relative h-2 bg-bg rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', isOver ? 'bg-critical' : 'bg-teal')}
                      style={{ width: `${percentage}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-text-tertiary"
                      style={{ left: `${benchmarkPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-[10px] text-text-tertiary mt-2">Vertical line = benchmark threshold</p>
          </div>
        </motion.div>
      </div>

      {/* Finance KPIs */}
      <div>
        <motion.h2 variants={itemVariants} className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Finance
        </motion.h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard title="Cash Expenses" value={formatINR(1420000)} icon={CreditCard} accent="navy" />
          <KPICard title="Bank Payments" value={formatINR(1630000)} icon={CreditCard} accent="teal" />
          <KPICard title="Pending Payments" value={formatINR(485000)} subtitle="12 pending" icon={CreditCard} trend="down" trendValue="-15%" accent="slate" />
          <KPICard title="Loan Interest" value={formatINR(125000)} subtitle="This month" icon={CreditCard} accent="navy" />
        </div>
      </div>

      {/* Exceptions */}
      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">Exception Centre</h3>
          <button className="flex items-center gap-1 text-xs font-medium text-teal hover:text-teal-900 transition-colors">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-border">
          {exceptions.map((exception) => {
            const Icon = exception.icon;
            return (
              <div
                key={exception.id}
                className="flex items-start gap-3 px-4 sm:px-5 py-3.5 hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                  exception.severity === 'critical' ? 'bg-critical-bg' : 'bg-warning-bg'
                )}>
                  <Icon className={cn(
                    'w-4 h-4',
                    exception.severity === 'critical' ? 'text-critical' : 'text-warning'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">{exception.title}</p>
                    <span className={cn(
                      'px-1.5 py-0.5 text-[10px] font-medium rounded-full',
                      exception.severity === 'critical'
                        ? 'bg-critical-bg text-critical'
                        : 'bg-warning-bg text-warning'
                    )}>
                      {exception.severity === 'critical' ? '🔴' : '🟠'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{exception.description}</p>
                </div>
                <span className="text-[10px] text-text-tertiary whitespace-nowrap shrink-0">
                  {exception.time}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Equipment Status */}
      <motion.div variants={itemVariants} className="bg-surface rounded-xl border border-border p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Equipment Status</h3>
          <button className="flex items-center gap-1 text-xs font-medium text-teal hover:text-teal-900 transition-colors">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'SANY-01', status: 'active', hours: '2,847' },
            { name: 'SANY-02', status: 'active', hours: '1,932' },
            { name: 'HITACHI-01', status: 'under_maintenance', hours: '3,156' },
            { name: 'DG-01', status: 'active', hours: '8,421' },
            { name: 'DG-02', status: 'active', hours: '5,617' },
            { name: 'TRACTOR-01', status: 'inactive', hours: '412' },
          ].map((eq) => (
            <div key={eq.name} className="text-center p-3 rounded-lg bg-bg hover:bg-navy-50 transition-colors cursor-pointer">
              <Truck className={cn(
                'w-6 h-6 mx-auto mb-2',
                eq.status === 'active' ? 'text-success' : eq.status === 'under_maintenance' ? 'text-warning' : 'text-text-tertiary'
              )} />
              <p className="text-xs font-semibold text-text-primary">{eq.name}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">{eq.hours} hrs</p>
              <span className={cn(
                'inline-block mt-1.5 px-2 py-0.5 text-[9px] font-medium rounded-full',
                eq.status === 'active' && 'bg-success-bg text-success',
                eq.status === 'under_maintenance' && 'bg-warning-bg text-warning',
                eq.status === 'inactive' && 'bg-slate-50 text-slate-500'
              )}>
                {eq.status === 'under_maintenance' ? 'Maintenance' : eq.status.charAt(0).toUpperCase() + eq.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
