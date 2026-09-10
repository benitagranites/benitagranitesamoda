// Benita Granites — Main Application Layout
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileDrawer from './MobileDrawer';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <TopNav />
      <MobileDrawer />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
