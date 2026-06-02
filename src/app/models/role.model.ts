export enum Role {
  ADMIN = 'admin',
  TECHNICIAN = 'technician'
}

export interface Permission {
  canManageUsers: boolean;
  canManageEquipment: boolean;
  canViewAlerts: boolean;
  canDeleteEquipment: boolean;
}

export const RolePermissions: Record<Role, Permission> = {
  [Role.ADMIN]: {
    canManageUsers: true,
    canManageEquipment: true,
    canViewAlerts: true,
    canDeleteEquipment: true
  },
  [Role.TECHNICIAN]: {
    canManageUsers: false,
    canManageEquipment: true,
    canViewAlerts: true,
    canDeleteEquipment: false
  }
};
