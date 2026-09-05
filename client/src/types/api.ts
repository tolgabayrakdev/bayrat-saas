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

export type Subscription = {
  id: string;
  status: "active" | "inactive" | "canceled";
  starts_at: string;
  ends_at: string | null;
  plan_code: string;
  plan_name: string;
  plan_description: string;
};

export type ApiResponse<T = undefined> = {
  success: true;
  message?: string;
  data: T;
};
