export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  profileImageUrl?: string;
  adminInviteToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  password?: string;
} 