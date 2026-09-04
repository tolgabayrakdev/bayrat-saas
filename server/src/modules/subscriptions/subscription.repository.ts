import { db } from "../../config/database";

type BillingPeriod = "monthly" | "quarterly" | "yearly";

export const subscriptionRepository = {
  listPlans() {
    return db("plans as p")
      .leftJoin("plan_options as po", "po.plan_id", "p.id")
      .where("p.active", true)
      .select("p.id", "p.code", "p.name", "p.description", "po.billing_period", "po.duration_months", "po.price_cents", "po.currency")
      .orderBy("po.duration_months", "asc");
  },

  findByUserId(userId: string) {
    return db("subscriptions as s")
      .join("plans as p", "p.id", "s.plan_id")
      .leftJoin("plan_options as po", "po.id", "s.plan_option_id")
      .where("s.user_id", userId)
      .select("s.id", "s.status", "s.starts_at", "s.ends_at", "p.code as plan_code", "p.name as plan_name", "po.billing_period", "po.duration_months")
      .first();
  },

  async expireIfNeeded(userId: string) {
    await db.transaction(async (transaction) => {
      const subscription = await transaction("subscriptions as s")
        .join("plans as p", "p.id", "s.plan_id")
        .where("s.user_id", userId)
        .where("p.code", "premium")
        .where("s.ends_at", "<=", transaction.fn.now())
        .select("s.id")
        .forUpdate()
        .first();

      if (!subscription) return;
      const freePlan = await transaction("plans")
        .where({ code: "free", active: true })
        .first("id");
      if (!freePlan) throw new Error("Free plan bulunamadı");

      await transaction("subscriptions")
        .where({ id: subscription.id })
        .update({
          plan_id: freePlan.id,
          plan_option_id: null,
          status: "active",
          starts_at: transaction.fn.now(),
          ends_at: null,
          updated_at: transaction.fn.now(),
        });
    });
  },

  async activatePremium(userId: string, billingPeriod: BillingPeriod) {
    await db.transaction(async (transaction) => {
      const option = await transaction("plan_options as po")
        .join("plans as p", "p.id", "po.plan_id")
        .where({ "p.code": "premium", "p.active": true, "po.billing_period": billingPeriod })
        .select("po.id", "po.plan_id", "po.duration_months")
        .first();
      if (!option) return;

      await transaction("subscriptions").where({ user_id: userId }).forUpdate().first();
      const now = new Date();
      const endsAt = new Date(now);
      endsAt.setUTCMonth(endsAt.getUTCMonth() + option.duration_months);

      await transaction("subscriptions")
        .insert({ user_id: userId, plan_id: option.plan_id, plan_option_id: option.id, status: "active", starts_at: now, ends_at: endsAt })
        .onConflict("user_id")
        .merge({ plan_id: option.plan_id, plan_option_id: option.id, status: "active", starts_at: now, ends_at: endsAt, updated_at: transaction.fn.now() });
    });
  },

  async activateFree(userId: string) {
    const freePlan = await db("plans").where({ code: "free", active: true }).first("id");
    if (!freePlan) return;
    await db("subscriptions").where({ user_id: userId }).update({ plan_id: freePlan.id, plan_option_id: null, status: "active", starts_at: db.fn.now(), ends_at: null, updated_at: db.fn.now() });
  },
};
