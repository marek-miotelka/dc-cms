export interface AdminUser {
  id: number;
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  displayName?: string;
  photoUrl?: string;
}