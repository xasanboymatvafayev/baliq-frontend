import {
  Activity,
  Database,
  BarChart2,
  Wallet,
  Banknote,
  ArrowDownCircle,
  ShieldCheck,
  CreditCard,
  BarChart3,
  Boxes,
  Car,
  ClipboardCheck,
  Fish,
  Gauge,
  Gift,
  Home,
  LockKeyhole,
  MapPinned,
  MessageSquare,
  PackagePlus,
  PackageSearch,
  Settings,
  ShoppingCart,
  Store,
  Tag,
  UserCog,
  Users,
} from 'lucide-react'

export const customerNavigation = [
  { label: 'Dashboard', key: 'dashboard', to: '/customer/dashboard', icon: Home },
  { label: 'Baliqlar katalogi', key: 'fishCatalog', to: '/customer/fish-catalog', icon: Fish },
  { label: "Ferma ro'yxati", key: 'farmList', to: '/customer/farms', icon: Store },
  { label: 'Mahsulot tafsiloti', key: 'productDetail', to: '/customer/product/overview', icon: PackageSearch },
  { label: 'Savatcha', key: 'cart', to: '/customer/cart', icon: ShoppingCart },
  { label: 'Buyurtmalarim', key: 'myOrders', to: '/customer/orders', icon: ClipboardCheck },
  { label: 'Chat', key: 'chat', to: '/customer/chat', icon: MessageSquare },
  { label: 'Profil', key: 'profile', to: '/customer/profile', icon: UserCog },
  { label: "To'lov & Bonus", key: 'paymentBonus', to: '/customer/payment', icon: CreditCard },
  { label: 'Xavfsizlik', key: 'security', to: '/customer/security', icon: ShieldCheck },
  { label: 'Sozlamalar', key: 'settings', to: '/customer/settings', icon: Settings },
]

export const farmNavigation = [
  { label: 'Dashboard', key: 'dashboard', to: '/farm/dashboard', icon: Home },
  { label: 'Baliqlar', key: 'fish', to: '/farm/fish', icon: Fish },
  { label: "Baliq qo'shish", key: 'addFish', to: '/farm/add-fish', icon: PackagePlus },
  { label: 'Ombor', key: 'inventory', to: '/farm/inventory', icon: Boxes },
  { label: 'Buyurtmalar', key: 'orders', to: '/farm/orders', icon: ClipboardCheck },
  { label: 'Mijozlar', key: 'customers', to: '/farm/customers', icon: Users },
  { label: 'Chat', key: 'chat', to: '/farm/chat', icon: MessageSquare },
  { label: 'Balans', key: 'balance', to: '/farm/balance', icon: Wallet },
  { label: 'Hisobotlar', key: 'reports', to: '/farm/reports', icon: BarChart3 },
  { label: 'Profil', key: 'profile', to: '/farm/profile', icon: UserCog },
]

export const driverNavigation = [
  { label: 'Dashboard', key: 'dashboard', to: '/driver/dashboard', icon: Home },
  { label: 'Mening yetkazishlarim', key: 'myDeliveries', to: '/driver/orders', icon: ClipboardCheck },
  { label: 'Jonli tracking', key: 'liveTracking', to: '/driver/live-tracking', icon: MapPinned },
  { label: 'Chat', key: 'chat', to: '/driver/chat', icon: MessageSquare },
  { label: 'Profil', key: 'profile', to: '/driver/profile', icon: UserCog },
  { label: 'Sozlamalar', key: 'settings', to: '/driver/settings', icon: Settings },
]

export const adminNavigation = [
  { label: 'Dashboard', key: 'dashboard', to: '/admin/dashboard', icon: Home },
  { label: "Ferma so'rovlari", key: 'farmRequests', to: '/admin/farm-requests', icon: Store },
  { label: "Haydovchi so'rovlari", key: 'driverRequests', to: '/admin/driver-requests', icon: Car },
  { label: 'Buyurtmalar', key: 'orders', to: '/admin/orders', icon: ClipboardCheck },
  { label: 'Foydalanuvchilar', key: 'users', to: '/admin/users', icon: Users },
  { label: 'Promo kodlar', key: 'promoCodes', to: '/admin/promo-codes', icon: Tag },
  { label: 'GPS Monitoring', key: 'gpsMonitoring', to: '/admin/gps-monitoring', icon: MapPinned },
  { label: 'Chat monitoring', key: 'chatMonitoring', to: '/admin/chat-monitoring', icon: MessageSquare },
  { label: 'Audit log', key: 'auditLog', to: '/admin/audit-log', icon: Activity },
  { label: 'Statistika', key: 'statistics', to: '/admin/statistics', icon: BarChart2 },
  { label: 'Sof foyda', key: 'netProfit', to: '/admin/finance', icon: Banknote },
  { label: 'Pul chiqarish', key: 'withdrawals', to: '/admin/withdrawals', icon: ArrowDownCircle },
  { label: 'Xavfsizlik', key: 'security', to: '/admin/security', icon: ShieldCheck },
  { label: 'DB Boshqaruv', key: 'dbAdmin', to: '/admin/db-admin', icon: Database },
  { label: 'Sozlamalar', key: 'settings', to: '/admin/settings', icon: Settings },
]

export const managerNavigation = [
  { label: 'Dashboard', key: 'dashboard', to: '/manager/dashboard', icon: Home },
  { label: 'GPS Monitoring', key: 'gpsMonitoring', to: '/manager/gps-monitoring', icon: MapPinned },
  { label: 'Buyurtmalar', key: 'orders', to: '/manager/orders', icon: ClipboardCheck },
  { label: 'Statistikalar', key: 'statistics', to: '/manager/statistics', icon: BarChart3 },
  { label: 'KPI', key: 'kpi', to: '/manager/kpi', icon: Gauge },
  { label: 'Hisobotlar', key: 'reports', to: '/manager/reports', icon: Activity },
  { label: 'Chat monitoring', key: 'chatMonitoring', to: '/manager/chat-monitoring', icon: MessageSquare },
]

export const superAdminNavigation = [
  { label: 'Tizim statistikasi', key: 'systemStatistics', to: '/super-admin/system-statistics', icon: BarChart3 },
  { label: 'Admin boshqaruvi', key: 'adminManagement', to: '/super-admin/admin-management', icon: ShieldCheck },
  { label: 'Rollar', key: 'roles', to: '/super-admin/roles', icon: Users },
  { label: 'Ruxsatlar', key: 'permissions', to: '/super-admin/permissions', icon: LockKeyhole },
  { label: 'Audit log', key: 'auditLog', to: '/super-admin/audit-log', icon: Activity },
  { label: 'Tizim sozlamalari', key: 'systemSettings', to: '/super-admin/system-settings', icon: Settings },
]

export const roleHome = {
  customer: '/customer/dashboard',
  farm: '/farm/dashboard',
  driver: '/driver/dashboard',
  admin: '/admin/dashboard',
  manager: '/manager/dashboard',
  superadmin: '/super-admin/system-statistics',
}
