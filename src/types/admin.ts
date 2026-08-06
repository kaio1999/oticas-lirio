export type AdminRole = "owner" | "staff";

export type AdminProfile = {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  canManageProducts: boolean;
  canManageTeam: boolean;
  active: boolean;
};

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  can_manage_products: boolean;
  can_manage_team: boolean;
  active: boolean;
};

export function mapProfile(row: ProfileRow): AdminProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    canManageProducts: row.role === "owner" || row.can_manage_products,
    canManageTeam: row.role === "owner" || row.can_manage_team,
    active: row.active,
  };
}
