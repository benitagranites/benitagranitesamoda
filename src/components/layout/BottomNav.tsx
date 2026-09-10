// Benita Granites — Mobile Bottom Navigation
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Mountain, Fuel, BarChart3, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bottomNavItems = [
  { id: 'dashboard', label: 'Home', path: '/', icon: LayoutDashboard },
  { id: 'production', label: 'Blocks', path: '/production', icon: Mountain },
  { id: 'add', label: 'Add', path: '', icon: Plus, isAction: true },
  { id: 'fuel', label: 'Fuel', path: '/fuel', icon: Fuel },
  { id: 'reports', label: 'Reports', path: '/reports', icon: BarChart3 },
];

interface QuickAddAction {
  label: string;
  path: string;
  color: string;
}

const quickAddActions: QuickAddAction[] = [
  { label: 'New Block', path: '/production/new', color: 'bg-navy' },
  { label: 'Fuel Entry', path: '/fuel/new', color: 'bg-teal' },
  { label: 'Expense', path: '/expenses/new', color: 'bg-slate-blue' },
  { label: 'Labour', path: '/labour/new', color: 'bg-navy-700' },
];

export default function BottomNav() {
  const location = useLocation();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <>
      {/* Quick Add Overlay */}
      <AnimatePresence>
        {showQuickAdd && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setShowQuickAdd(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-20 left-4 right-4 z-50 lg:hidden"
            >
              <div className="bg-surface rounded-2xl shadow-xl border border-border p-3 space-y-1.5">
                <p className="text-xs font-semibold text-text-secondary px-3 py-1">
                  Quick Actions
                </p>
                {quickAddActions.map((action) => (
                  <NavLink
                    key={action.label}
                    to={action.path}
                    onClick={() => setShowQuickAdd(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-navy-50 transition-colors"
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', action.color)}>
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">{action.label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path
              ? (item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path))
              : false;

            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  className="flex flex-col items-center justify-center -mt-4"
                >
                  <div className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform',
                    showQuickAdd
                      ? 'bg-critical rotate-45'
                      : 'bg-teal'
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </button>
              );
            }

            return (
              <NavLink
                key={item.id}
                to={item.path}
                className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 min-w-[60px]"
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-navy' : 'text-text-tertiary'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive ? 'text-navy' : 'text-text-tertiary'
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="w-5 h-0.5 bg-navy rounded-full mt-0.5"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
