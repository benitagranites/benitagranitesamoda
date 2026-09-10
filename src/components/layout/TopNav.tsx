// Benita Granites — Top Navigation Bar
import { Menu, Search, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { getInitials } from '@/lib/utils';
import { ROLE_LABELS } from '@/constants';
import type { UserRole } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNav() {
  const { profile, logout } = useAuthStore();
  const { toggleMobileMenu, toggleSearch } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Left: Menu + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-navy-50 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-navy" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center">
              <span className="text-white font-bold text-sm">BG</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-navy leading-tight tracking-tight">
                BENITA GRANITES
              </h1>
              <p className="text-[10px] text-text-secondary leading-tight -mt-0.5">
                Mine Management MIS
              </p>
            </div>
          </div>
        </div>

        {/* Right: Search + Notifications + Profile */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSearch}
            className="p-2 rounded-lg hover:bg-navy-50 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-slate-blue" />
          </button>

          <button
            className="p-2 rounded-lg hover:bg-navy-50 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-blue" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full" />
          </button>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-50 transition-colors ml-1"
            >
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.username}
                  className="w-8 h-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {getInitials(profile?.username || 'U')}
                  </span>
                </div>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-blue hidden sm:block" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-xl border border-border shadow-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-border bg-navy-50/30">
                    <p className="text-sm font-semibold text-navy">
                      {profile?.username || 'User'}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {profile?.email}
                    </p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-medium bg-teal-50 text-teal-800 rounded-full border border-teal-200">
                      {ROLE_LABELS[profile?.role as UserRole] || 'User'}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-text-primary rounded-lg hover:bg-navy-50 transition-colors">
                      <User className="w-4 h-4 text-slate-blue" />
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-critical rounded-lg hover:bg-critical-bg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
