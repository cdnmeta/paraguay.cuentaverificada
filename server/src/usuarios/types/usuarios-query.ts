export interface UserByQuery {
  id: number;
  documento: string;
  email: string;
}

export interface UsersForQueryMany {
  nombre?: string;
  documento?: string;
  email?: string;
}
