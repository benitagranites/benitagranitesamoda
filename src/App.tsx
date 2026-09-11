// Benita Granites — Main Application with Routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import LoginPage from '@/features/auth/LoginPage';
import SignupPage from '@/features/auth/SignupPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import BlockListPage from '@/features/production/BlockListPage';
import BlockFormPage from '@/features/production/BlockFormPage';
import BlockDetailPage from '@/features/production/BlockDetailPage';
import DressingListPage from '@/features/dressing/DressingListPage';
import DressingFormPage from '@/features/dressing/DressingFormPage';
import DressingDetailPage from '@/features/dressing/DressingDetailPage';
import EquipmentListPage from '@/features/equipment/EquipmentListPage';
import EquipmentFormPage from '@/features/equipment/EquipmentFormPage';
import FuelListPage from '@/features/fuel/FuelListPage';
import FuelFormPage from '@/features/fuel/FuelFormPage';
import GeneratorListPage from '@/features/generators/GeneratorListPage';
import GeneratorFormPage from '@/features/generators/GeneratorFormPage';
import TractorRentListPage from '@/features/tractor-rent/TractorRentListPage';
import TractorRentFormPage from '@/features/tractor-rent/TractorRentFormPage';
import EmployeeListPage from '@/features/employees/EmployeeListPage';
import EmployeeFormPage from '@/features/employees/EmployeeFormPage';
import DailyLabourListPage from '@/features/employees/DailyLabourListPage';
import DailyLabourFormPage from '@/features/employees/DailyLabourFormPage';
import PurchaseListPage from '@/features/purchases/PurchaseListPage';
import PurchaseFormPage from '@/features/purchases/PurchaseFormPage';
import KitchenDashboardPage from '@/features/kitchen/KitchenDashboardPage';
import KitchenDailyFormPage from '@/features/kitchen/KitchenDailyFormPage';
import KitchenStaffPage from '@/features/kitchen/KitchenStaffPage';
import ModulePage from '@/components/ui/ModulePage';
import {
  Package, Shield, Link as CreditCard, BarChart3, Settings,
} from 'lucide-react';

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return (
    <BrowserRouter>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#17202A',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: "'Inter', system-ui, sans-serif",
            boxShadow: '0 10px 15px -3px rgba(15, 39, 71, 0.06)',
          },
          success: {
            iconTheme: { primary: '#15803D', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#DC2626', secondary: '#fff' },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          <Route path="production" element={<BlockListPage />} />
          <Route path="production/new" element={<BlockFormPage />} />
          <Route path="production/:id" element={<BlockDetailPage />} />
          <Route path="production/:id/edit" element={<BlockFormPage />} />

          <Route path="dressing" element={<DressingListPage />} />
          <Route path="dressing/new" element={<DressingFormPage />} />
          <Route path="dressing/:id" element={<DressingDetailPage />} />
          <Route path="dressing/:id/edit" element={<DressingFormPage />} />

          <Route path="inventory" element={
            <ModulePage title="Block Inventory" description="View and manage all granite block inventory" icon={Package} />
          } />

          <Route path="equipment" element={<EquipmentListPage />} />
          <Route path="equipment/new" element={<EquipmentFormPage />} />
          <Route path="equipment/:id/edit" element={<EquipmentFormPage />} />

          <Route path="fuel" element={<FuelListPage />} />
          <Route path="fuel/new" element={<FuelFormPage />} />

          <Route path="generators" element={<GeneratorListPage />} />
          <Route path="generators/new" element={<GeneratorFormPage />} />

          <Route path="tractor-rent" element={<TractorRentListPage />} />
          <Route path="tractor-rent/new" element={<TractorRentFormPage />} />

          <Route path="employees" element={<EmployeeListPage />} />
          <Route path="employees/new" element={<EmployeeFormPage />} />
          <Route path="employees/:id/edit" element={<EmployeeFormPage />} />

          <Route path="labour" element={<DailyLabourListPage />} />
          <Route path="labour/new" element={<DailyLabourFormPage />} />

          <Route path="kitchen" element={<KitchenDashboardPage />} />
          <Route path="kitchen/new" element={<KitchenDailyFormPage />} />
          <Route path="kitchen/staff" element={<KitchenStaffPage />} />

          <Route path="purchases" element={<PurchaseListPage />} />
          <Route path="purchases/new" element={<PurchaseFormPage />} />

          <Route path="management-expenses" element={
            <ModulePage title="Management / Special Expenses" description="Government, liaison, CSR, finance, and incidental expenses" icon={Shield} />
          } />

          <Route path="payments" element={
            <ModulePage title="Payments & Finance" description="Track all payments, bank transfers, and pending approvals" icon={CreditCard} />
          } />
          <Route path="payments/new" element={
            <ModulePage title="Record Payment" description="Record a new payment transaction" icon={CreditCard} />
          } />

          <Route path="reports" element={
            <ModulePage title="Reports" description="Management reports, daily summaries, and analytics" icon={BarChart3} />
          } />

          <Route path="admin" element={
            <ModulePage title="Masters & Settings" description="Manage users, roles, equipment, suppliers, and system settings" icon={Settings} />
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
