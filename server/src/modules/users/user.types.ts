export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  token_version: number;
  email_verified_at: Date | null;
  created_at: Date;
};

export type PublicUser = Omit<UserRow, "password_hash" | "token_version">;
