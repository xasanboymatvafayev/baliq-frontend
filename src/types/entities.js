export const ROLES = {
  CUSTOMER: 'customer',
  FARM_OWNER: 'farm-owner',
  DRIVER: 'driver',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPER_ADMIN: 'super-admin',
}

export const FARM_STATUSES = ['PENDING', 'APPROVED', 'REJECTED']

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'DRIVER_ASSIGNED',
  'LOADING',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
]

export const ROLE_LABELS = {
  [ROLES.CUSTOMER]: 'Mijoz',
  [ROLES.FARM_OWNER]: 'Ferma egasi',
  [ROLES.DRIVER]: 'Haydovchi',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MANAGER]: 'Menejer',
  [ROLES.SUPER_ADMIN]: 'Super Admin',
}
