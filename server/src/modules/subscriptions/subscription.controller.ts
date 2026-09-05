import type { Request, Response } from "express";
import { subscriptionService } from "./subscription.service";

export const subscriptionController = {
  async listPlans(_request: Request, response: Response) {
    response.json({ success: true, data: await subscriptionService.listPlans() });
  },

  async getCurrent(request: Request, response: Response) {
    response.json({
      success: true,
      data: await subscriptionService.getCurrent(request.auth!.userId),
    });
  },
};
