import { Router } from "express";
import { validate } from "../../shared/middlewares/validate";
import { authController } from "./auth.controller";
import { loginRateLimit, verificationRateLimit } from "./auth.rate-limit";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schemas";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), authController.register);
authRouter.post(
  "/login",
  loginRateLimit,
  validate({ body: loginSchema }),
  authController.login,
);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.post(
  "/verify-email",
  verificationRateLimit,
  validate({ body: verifyEmailSchema }),
  authController.verifyEmail,
);
authRouter.post(
  "/resend-verification",
  verificationRateLimit,
  validate({ body: resendVerificationSchema }),
  authController.resendVerification,
);
authRouter.post(
  "/forgot-password",
  verificationRateLimit,
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password",
  verificationRateLimit,
  validate({ body: resetPasswordSchema }),
  authController.resetPassword,
);
