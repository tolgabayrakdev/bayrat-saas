import { Router } from "express";
import { validate } from "../../shared/middlewares/validate";
import { requireAuth } from "../auth/auth.middleware";
import { userController } from "./user.controller";
import {
  deleteAccountSchema,
  requestEmailChangeSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from "./user.schemas";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/me", userController.getMe);
userRouter.patch(
  "/me",
  validate({ body: updateProfileSchema }),
  userController.updateProfile,
);
userRouter.patch(
  "/me/password",
  validate({ body: updatePasswordSchema }),
  userController.updatePassword,
);
userRouter.post(
  "/me/email-change",
  validate({ body: requestEmailChangeSchema }),
  userController.requestEmailChange,
);
userRouter.delete(
  "/me",
  validate({ body: deleteAccountSchema }),
  userController.deleteAccount,
);
