export type User = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
};

export type Session = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type BillingPeriod = "monthly" | "quarterly" | "yearly";

export type Plan = {
  id: string;
  code: "free" | "premium";
  name: string;
  description: string;
  options: Array<{
    billingPeriod: BillingPeriod;
    durationMonths: number;
    priceCents: number | null;
    currency: string;
  }>;
};

export type Subscription = {
  id: string;
  status: "active" | "canceled" | "expired";
  starts_at: string;
  ends_at: string | null;
  plan_code: "free" | "premium";
  plan_name: string;
  billing_period: BillingPeriod | null;
  duration_months: number | null;
};

export type ApiResponse<T = undefined> = {
  success: true;
  message?: string;
  data: T;
};
