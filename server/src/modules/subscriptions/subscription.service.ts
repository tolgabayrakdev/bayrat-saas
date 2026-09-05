import { appError } from "../../shared/errors/app-error";
import { subscriptionRepository } from "./subscription.repository";

export const subscriptionService = {
  listPlans: () => subscriptionRepository.listPlans(),

  async getCurrent(userId: string) {
    const subscription = await subscriptionRepository.findByUserId(userId);
    if (!subscription) {
      throw appError(404, "Üyelik bulunamadı", "SUBSCRIPTION_NOT_FOUND");
    }
    return subscription;
  },
};
