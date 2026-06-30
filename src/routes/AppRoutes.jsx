import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout.jsx'
import { DashboardLayout } from '../layouts/DashboardLayout.jsx'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { LandingPage } from '../pages/LandingPage.jsx'
import { NotFoundPage } from '../pages/NotFoundPage.jsx'
import { DriverRegistration } from '../pages/auth/DriverRegistration.jsx'
import { FarmRegistration } from '../pages/auth/FarmRegistration.jsx'
import { ForgotPassword } from '../pages/auth/ForgotPassword.jsx'
import { Login } from '../pages/auth/Login.jsx'
import { OtpVerification } from '../pages/auth/OtpVerification.jsx'
import { Register } from '../pages/auth/Register.jsx'
import { ResetPassword } from '../pages/auth/ResetPassword.jsx'
import { TelegramLinkPage } from '../pages/auth/TelegramLinkPage.jsx'
import { FirebaseOtpPage } from '../pages/auth/FirebaseOtpPage.jsx'
import { FirebaseForgotOtpPage } from '../pages/auth/FirebaseForgotOtpPage.jsx'
import {
  AdminAuditLog, AdminChatMonitoring, AdminDashboard, AdminDriverRequests,
  AdminFarmRequests, AdminGpsMonitoring, AdminOrders, AdminSettings, AdminUsers,
} from '../pages/admin/AdminPages.jsx'
import DbAdminPanel from '../pages/admin/DbAdminPanel.jsx'
import { AdminPromoPage } from '../pages/admin/AdminPromoPage.jsx'
import { AdminStatisticsPage } from '../pages/shared/AdminStatisticsPage.jsx'
import { AdminFinancePage, AdminWithdrawPage } from '../pages/admin/FinancePage.jsx'
import { FarmBalancePage } from '../pages/farm/FarmBalancePage.jsx'
import { PaymentPage } from '../pages/customer/PaymentPage.jsx'
import { SecurityPage } from '../pages/shared/SecurityPage.jsx'
import {
  CustomerCart, CustomerChat, CustomerDashboard, CustomerFarms,
  CustomerFishCatalog, CustomerOrders, CustomerProductDetail,
  CustomerProfile, CustomerSettings,
} from '../pages/customer/CustomerPages.jsx'
import {
  FarmAddFish, FarmChat, FarmCustomers, FarmDashboard, FarmFish,
  FarmInventory, FarmOrders, FarmProfile, FarmReports,
} from '../pages/farm/FarmPages.jsx'
import {
  DriverChat, DriverDashboard, DriverLiveTracking,
  DriverOrders, DriverProfile, DriverSettings,
} from '../pages/driver/DriverPages.jsx'
import {
  ManagerChatMonitoring, ManagerDashboard, ManagerGpsMonitoring,
  ManagerKpi, ManagerOrders, ManagerReports, ManagerStatistics,
} from '../pages/manager/ManagerPages.jsx'
import {
  AdminManagement, PermissionsPage, RolesPage,
  SuperAdminAuditLog, SystemSettings, SystemStatistics,
} from '../pages/superadmin/SuperAdminPages.jsx'
import {
  adminNavigation, customerNavigation, driverNavigation,
  farmNavigation, managerNavigation, superAdminNavigation,
} from './navigation.js'

export function AppRoutes() {
  const location = useLocation()
  return (
    <Routes location={location} key={location.pathname}>
      {/* Ochiq sahifalar */}
      <Route path="/" element={<LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route path="/farm-registration" element={<FarmRegistration />} />
      <Route path="/driver-registration" element={<DriverRegistration />} />
      <Route path="/telegram-link" element={<TelegramLinkPage />} />
      <Route path="/firebase-otp" element={<FirebaseOtpPage />} />
      <Route path="/firebase-forgot-otp" element={<FirebaseForgotOtpPage />} />

      {/* Himoyalangan sahifalar */}
      <Route path="/customer" element={
        <ProtectedRoute>
          <DashboardLayout navigation={customerNavigation} title="Mijoz paneli" />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="fish-catalog" element={<CustomerFishCatalog />} />
        <Route path="farms" element={<CustomerFarms />} />
        <Route path="product/:id" element={<CustomerProductDetail />} />
        <Route path="cart" element={<CustomerCart />} />
        <Route path="orders" element={<CustomerOrders />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="chat" element={<CustomerChat />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="settings" element={<CustomerSettings />} />
      </Route>

      <Route path="/farm" element={
        <ProtectedRoute>
          <DashboardLayout navigation={farmNavigation} title="Ferma paneli" />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FarmDashboard />} />
        <Route path="fish" element={<FarmFish />} />
        <Route path="add-fish" element={<FarmAddFish />} />
        <Route path="inventory" element={<FarmInventory />} />
        <Route path="orders" element={<FarmOrders />} />
        <Route path="customers" element={<FarmCustomers />} />
        <Route path="chat" element={<FarmChat />} />
        <Route path="reports" element={<FarmReports />} />
        <Route path="balance" element={<FarmBalancePage />} />
        <Route path="profile" element={<FarmProfile />} />
      </Route>

      <Route path="/driver" element={
        <ProtectedRoute>
          <DashboardLayout navigation={driverNavigation} title="Haydovchi paneli" />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DriverDashboard />} />
        <Route path="orders" element={<DriverOrders />} />
        <Route path="live-tracking" element={<DriverLiveTracking />} />
        <Route path="chat" element={<DriverChat />} />
        <Route path="profile" element={<DriverProfile />} />
        <Route path="settings" element={<DriverSettings />} />
      </Route>

      <Route path="/admin" element={
        <ProtectedRoute>
          <DashboardLayout navigation={adminNavigation} title="Admin paneli" />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="farm-requests" element={<AdminFarmRequests />} />
        <Route path="driver-requests" element={<AdminDriverRequests />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="chat-monitoring" element={<AdminChatMonitoring />} />
        <Route path="gps-monitoring" element={<AdminGpsMonitoring />} />
        <Route path="audit-log" element={<AdminAuditLog />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="db-admin" element={<DbAdminPanel />} />
        <Route path="statistics" element={<AdminStatisticsPage />} />
        <Route path="finance" element={<AdminFinancePage />} />
        <Route path="withdrawals" element={<AdminWithdrawPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="promo-codes" element={<AdminPromoPage />} />
      </Route>

      <Route path="/manager" element={
        <ProtectedRoute>
          <DashboardLayout navigation={managerNavigation} title="Menejer paneli" />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="gps-monitoring" element={<ManagerGpsMonitoring />} />
        <Route path="orders" element={<ManagerOrders />} />
        <Route path="statistics" element={<ManagerStatistics />} />
        <Route path="kpi" element={<ManagerKpi />} />
        <Route path="reports" element={<ManagerReports />} />
        <Route path="chat-monitoring" element={<ManagerChatMonitoring />} />
      </Route>

      <Route path="/super-admin" element={
        <ProtectedRoute>
          <DashboardLayout navigation={superAdminNavigation} title="Super Admin" />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="system-statistics" replace />} />
        <Route path="system-statistics" element={<SystemStatistics />} />
        <Route path="admin-management" element={<AdminManagement />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="audit-log" element={<SuperAdminAuditLog />} />
        <Route path="system-settings" element={<SystemSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
