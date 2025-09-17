export interface UserByQuery {
  id: number;
  documento: string;
  email: string;
}

export interface UsersForQueryMany {
  estado?: string;
  is_super_admin?: boolean;
  nombre?: string;
  documento?: string;
  email?: string;
}
