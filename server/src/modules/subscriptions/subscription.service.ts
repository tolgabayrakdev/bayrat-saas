import { appError } from "../../shared/errors/app-error";
import { subscriptionRepository } from "./subscription.repository";
import type { UpgradeSubscriptionInput } from "./subscription.schemas";

export const subscriptionService = {
  async listPlans() {
    const rows = await subscriptionRepository.listPlans();
    return Object.values(rows.reduce<Record<string, { id: string; code: string; name: string; description: string; options: unknown[] }>>((plans, row) => {
      plans[row.id] ??= { id: row.id, code: row.code, name: row.name, description: row.description, options: [] };
      if (row.billing_period) plans[row.id].options.push({ billingPeriod: row.billing_period, durationMonths: row.duration_months, priceCents: row.price_cents, currency: row.currency });
      return plans;
    }, {}));
  },

  async getCurrent(userId: string) {
    await subscriptionRepository.expireIfNeeded(userId);
    const subscription = await subscriptionRepository.findByUserId(userId);
    if (!subscription) throw appError(404, "Abonelik bulunamadı", "SUBSCRIPTION_NOT_FOUND");
    return subscription;
  },

  async hasPremium(userId: string) {
    const subscription = await this.getCurrent(userId);
    return subscription.plan_code === "premium";
  },

  async upgrade(userId: string, input: UpgradeSubscriptionInput) {
    const current = await this.getCurrent(userId);
    if (current.plan_code === "premium" && current.billing_period === input.billingPeriod) {
      throw appError(409, "Bu abonelik dönemi zaten aktif", "SUBSCRIPTION_ALREADY_ACTIVE");
    }
    await subscriptionRepository.activatePremium(userId, input.billingPeriod);
    return this.getCurrent(userId);
  },

  async cancel(userId: string) {
    await subscriptionRepository.activateFree(userId);
    return this.getCurrent(userId);
  },
};
