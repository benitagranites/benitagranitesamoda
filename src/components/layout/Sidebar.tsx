// Benita Granites — Desktop Sidebar Navigation
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Mountain, Scissors, Package, Truck, Fuel, Zap, Tractor,
  Users, ChefHat, Receipt, Shield, CreditCard, BarChart3, Settings,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { motion } from 'framer-motion';

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

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="hidden lg:flex flex-col h-[calc(100vh-56px)] bg-surface border-r border-border sticky top-14 overflow-hidden"
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-end px-3 py-2">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-navy-50 transition-colors"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <ChevronLeft
            className={cn(
              'w-4 h-4 text-slate-blue transition-transform duration-300',
              !sidebarOpen && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-4 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-slate-blue hover:bg-navy-50 hover:text-navy'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              {Icon && (
                <Icon
                  className={cn(
                    'w-[18px] h-[18px] shrink-0',
                    isActive ? 'text-white' : 'text-slate-blue-500 group-hover:text-navy'
                  )}
                />
              )}
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}

              {/* Tooltip for collapsed state */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-navy text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[10px] text-text-tertiary text-center">
            Benita Granites MIS v1.0
          </p>
        </div>
      )}
    </motion.aside>
  );
}
