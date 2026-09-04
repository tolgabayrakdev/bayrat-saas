import type { RequestHandler } from "express";
import { appError } from "../../shared/errors/app-error";
import { subscriptionService } from "./subscription.service";

export const requirePremium: RequestHandler = async (request, _response, next) => {
  try {
    const hasPremium = await subscriptionService.hasPremium(request.auth!.userId);
    if (!hasPremium) {
      next(appError(403, "Bu özellik Premium abonelik gerektirir", "PREMIUM_REQUIRED"));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};
