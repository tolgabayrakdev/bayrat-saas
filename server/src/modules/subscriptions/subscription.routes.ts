import { Router } from "express";
import { validate } from "../../shared/middlewares/validate";
import { requireAuth } from "../auth/auth.middleware";
import { subscriptionController } from "./subscription.controller";
import { upgradeSubscriptionSchema } from "./subscription.schemas";

export const subscriptionRouter = Router();

subscriptionRouter.get("/plans", subscriptionController.listPlans);
subscriptionRouter.use(requireAuth);
subscriptionRouter.get("/me", subscriptionController.getCurrent);
subscriptionRouter.post("/me/upgrade", validate({ body: upgradeSubscriptionSchema }), subscriptionController.upgrade);
subscriptionRouter.post("/me/cancel", subscriptionController.cancel);
