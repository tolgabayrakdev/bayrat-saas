import type { Request, Response } from "express";
import type { UpgradeSubscriptionInput } from "./subscription.schemas";
import { subscriptionService } from "./subscription.service";

export const subscriptionController = {
  async listPlans(_request: Request, response: Response) {
    response.json({ success: true, data: await subscriptionService.listPlans() });
  },
  async getCurrent(request: Request, response: Response) {
    response.json({ success: true, data: await subscriptionService.getCurrent(request.auth!.userId) });
  },
  async upgrade(request: Request, response: Response) {
    const subscription = await subscriptionService.upgrade(request.auth!.userId, request.body as UpgradeSubscriptionInput);
    response.json({ success: true, message: "Demo premium aboneliğiniz aktif edildi", data: subscription });
  },
  async cancel(request: Request, response: Response) {
    const subscription = await subscriptionService.cancel(request.auth!.userId);
    response.json({ success: true, message: "Premium aboneliğiniz iptal edildi", data: subscription });
  },
};
