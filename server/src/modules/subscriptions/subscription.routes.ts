import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { subscriptionController } from "./subscription.controller";

export const subscriptionRouter = Router();

subscriptionRouter.get("/plans", subscriptionController.listPlans);
subscriptionRouter.get("/me", requireAuth, subscriptionController.getCurrent);
