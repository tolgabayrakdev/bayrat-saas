export type User = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
};

export type Session = {
  user: User;
};

export type ApiResponse<T = undefined> = {
  success: true;
  message?: string;
  data: T;
};
