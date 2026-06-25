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
  { label: 'Dashboard', to: '/customer/dashboard', icon: Home },
  { label: 'Baliqlar katalogi', to: '/customer/fish-catalog', icon: Fish },
  { label: "Ferma ro'yxati", to: '/customer/farms', icon: Store },
  { label: 'Mahsulot tafsiloti', to: '/customer/product/overview', icon: PackageSearch },
  { label: 'Savatcha', to: '/customer/cart', icon: ShoppingCart },
  { label: 'Buyurtmalarim', to: '/customer/orders', icon: ClipboardCheck },
  { label: 'Chat', to: '/customer/chat', icon: MessageSquare },
  { label: 'Profil', to: '/customer/profile', icon: UserCog },
  { label: "To'lov & Bonus", to: '/customer/payment', icon: CreditCard },
  { label: 'Xavfsizlik', to: '/customer/security', icon: ShieldCheck },
  { label: 'Sozlamalar', to: '/customer/settings', icon: Settings },
]

export const farmNavigation = [
  { label: 'Dashboard', to: '/farm/dashboard', icon: Home },
  { label: 'Baliqlar', to: '/farm/fish', icon: Fish },
  { label: "Baliq qo'shish", to: '/farm/add-fish', icon: PackagePlus },
  { label: 'Ombor', to: '/farm/inventory', icon: Boxes },
  { label: 'Buyurtmalar', to: '/farm/orders', icon: ClipboardCheck },
  { label: 'Mijozlar', to: '/farm/customers', icon: Users },
  { label: 'Chat', to: '/farm/chat', icon: MessageSquare },
  { label: 'Balans', to: '/farm/balance', icon: Wallet },
  { label: 'Hisobotlar', to: '/farm/reports', icon: BarChart3 },
  { label: 'Profil', to: '/farm/profile', icon: UserCog },
]

export const driverNavigation = [
  { label: 'Dashboard', to: '/driver/dashboard', icon: Home },
  { label: 'Mening buyurtmalarim', to: '/driver/orders', icon: ClipboardCheck },
  { label: 'Jonli tracking', to: '/driver/live-tracking', icon: MapPinned },
  { label: 'Chat', to: '/driver/chat', icon: MessageSquare },
  { label: 'Profil', to: '/driver/profile', icon: UserCog },
  { label: 'Sozlamalar', to: '/driver/settings', icon: Settings },
]

export const adminNavigation = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: Home },
  { label: "Ferma so'rovlari", to: '/admin/farm-requests', icon: Store },
  { label: "Haydovchi so'rovlari", to: '/admin/driver-requests', icon: Car },
  { label: 'Buyurtmalar', to: '/admin/orders', icon: ClipboardCheck },
  { label: 'Foydalanuvchilar', to: '/admin/users', icon: Users },
  { label: 'Promo kodlar', to: '/admin/promo-codes', icon: Tag },
  { label: 'GPS Monitoring', to: '/admin/gps-monitoring', icon: MapPinned },
  { label: 'Chat monitoring', to: '/admin/chat-monitoring', icon: MessageSquare },
  { label: 'Audit log', to: '/admin/audit-log', icon: Activity },
  { label: 'Statistika', to: '/admin/statistics', icon: BarChart2 },
  { label: 'Sof foyda', to: '/admin/finance', icon: Banknote },
  { label: 'Pul chiqarish', to: '/admin/withdrawals', icon: ArrowDownCircle },
  { label: 'Xavfsizlik', to: '/admin/security', icon: ShieldCheck },
  { label: 'DB Boshqaruv', to: '/admin/db-admin', icon: Database },
  { label: 'Sozlamalar', to: '/admin/settings', icon: Settings },
]

export const managerNavigation = [
  { label: 'Dashboard', to: '/manager/dashboard', icon: Home },
  { label: 'GPS Monitoring', to: '/manager/gps-monitoring', icon: MapPinned },
  { label: 'Buyurtmalar', to: '/manager/orders', icon: ClipboardCheck },
  { label: 'Statistikalar', to: '/manager/statistics', icon: BarChart3 },
  { label: 'KPI', to: '/manager/kpi', icon: Gauge },
  { label: 'Hisobotlar', to: '/manager/reports', icon: Activity },
  { label: 'Chat monitoring', to: '/manager/chat-monitoring', icon: MessageSquare },
]

export const superAdminNavigation = [
  { label: 'Tizim statistikasi', to: '/super-admin/system-statistics', icon: BarChart3 },
  { label: 'Admin boshqaruvi', to: '/super-admin/admin-management', icon: ShieldCheck },
  { label: 'Rollar', to: '/super-admin/roles', icon: Users },
  { label: 'Ruxsatlar', to: '/super-admin/permissions', icon: LockKeyhole },
  { label: 'Audit log', to: '/super-admin/audit-log', icon: Activity },
  { label: 'Tizim sozlamalari', to: '/super-admin/system-settings', icon: Settings },
]

export const roleHome = {
  customer: '/customer/dashboard',
  farm: '/farm/dashboard',
  driver: '/driver/dashboard',
  admin: '/admin/dashboard',
  manager: '/manager/dashboard',
  superadmin: '/super-admin/system-statistics',
}
