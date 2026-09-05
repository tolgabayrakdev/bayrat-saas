import { db } from "../../config/database";

export const subscriptionRepository = {
  listPlans: () =>
    db("plans")
      .where({ active: true })
      .select("id", "code", "name", "description")
      .orderBy("created_at", "asc"),

  findByUserId: (userId: string) =>
    db("subscriptions as subscription")
      .join("plans as plan", "plan.id", "subscription.plan_id")
      .where("subscription.user_id", userId)
      .select(
        "subscription.id",
        "subscription.status",
        "subscription.starts_at",
        "subscription.ends_at",
        "plan.code as plan_code",
        "plan.name as plan_name",
        "plan.description as plan_description",
      )
      .first(),
};
