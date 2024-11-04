export interface AuthJwtUser {
  id: number;
  email: string;
  username: string;
}

export interface AuthSignJwtResponse {
  accessToken: string;
  expiresAt: number;
  user: AuthJwtUser;
}
