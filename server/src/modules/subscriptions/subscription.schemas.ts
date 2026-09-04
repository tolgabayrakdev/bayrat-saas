import { z } from "zod";

export const upgradeSubscriptionSchema = z.object({
  billingPeriod: z.enum(["monthly", "quarterly", "yearly"]),
});

export type UpgradeSubscriptionInput = z.infer<typeof upgradeSubscriptionSchema>;
