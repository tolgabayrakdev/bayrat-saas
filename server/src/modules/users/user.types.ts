export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
};

export type PublicUser = Omit<UserRow, "password_hash">;
