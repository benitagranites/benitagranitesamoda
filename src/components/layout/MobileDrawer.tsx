// Benita Granites — Mobile Drawer Navigation
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Mountain, Scissors, Package, Truck, Fuel, Zap, Tractor,
  Users, ChefHat, Receipt, Shield, CreditCard, BarChart3, Settings,
  X, } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { getInitials } from '@/lib/utils';
import { ROLE_LABELS } from '@/constants';
import type { UserRole } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Mountain, Scissors, Package, Truck, Fuel, Zap, Tractor,
  Users, ChefHat, Receipt, Shield, CreditCard, BarChart3, Settings,
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { id: 'production', label: 'Block Production', path: '/production', icon: 'Mountain' },
  { id: 'dressing', label: 'Dressing', path: '/dressing', icon: 'Scissors' },
  { id: 'inventory', label: 'Block Inventory', path: '/inventory', icon: 'Package' },
  { id: 'equipment', label: 'Vehicles & Equipment', path: '/equipment', icon: 'Truck' },
  { id: 'fuel', label: 'Fuel Control', path: '/fuel', icon: 'Fuel' },
  { id: 'generators', label: 'Generators', path: '/generators', icon: 'Zap' },
  { id: 'tractor-rent', label: 'Tractor Rent', path: '/tractor-rent', icon: 'Tractor' },
  { id: 'employees', label: 'Permanent Staff', path: '/employees', icon: 'Users' },
  { id: 'labour', label: 'Daily Labour', path: '/labour', icon: 'Users' },
  { id: 'kitchen', label: 'Kitchen', path: '/kitchen', icon: 'ChefHat' },
  { id: 'purchases', label: 'Purchase Register', path: '/purchases', icon: 'Receipt' },
  { id: 'management-expenses', label: 'Management Expenses', path: '/management-expenses', icon: 'Shield' },
  { id: 'payments', label: 'Payments & Finance', path: '/payments', icon: 'CreditCard' },
  { id: 'reports', label: 'Reports', path: '/reports', icon: 'BarChart3' },
  { id: 'admin', label: 'Masters & Settings', path: '/admin', icon: 'Settings' },
];

export default function MobileDrawer() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { profile } = useAuthStore();
  const location = useLocation();

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 left-0 w-[280px] bg-surface z-50 lg:hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BG</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-navy">BENITA GRANITES</h2>
                  <p className="text-[10px] text-text-secondary">Mine Management MIS</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-navy-50 transition-colors"
              >
                <X className="w-5 h-5 text-slate-blue" />
              </button>
            </div>

            {/* User Info */}
            <div className="px-4 py-3 border-b border-border bg-navy-50/30">
              <div className="flex items-center gap-3">
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {getInitials(profile?.username || 'U')}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy truncate">
                    {profile?.username}
                  </p>
                  <p className="text-xs text-text-secondary truncate">{profile?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-teal-50 text-teal-800 rounded-full border border-teal-200">
                    {ROLE_LABELS[profile?.role as UserRole] || 'User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
              {navItems.map((item, index) => {
                const Icon = iconMap[item.icon];
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <NavLink
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'bg-navy text-white shadow-sm'
                          : 'text-slate-blue hover:bg-navy-50 hover:text-navy'
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            'w-[18px] h-[18px] shrink-0',
                            isActive ? 'text-white' : 'text-slate-blue-500'
                          )}
                        />
                      )}
                      <span>{item.label}</span>
                    </NavLink>
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border">
              <p className="text-[10px] text-text-tertiary text-center">
                Benita Granites MIS v1.0
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
