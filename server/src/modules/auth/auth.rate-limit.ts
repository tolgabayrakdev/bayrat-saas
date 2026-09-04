import { rateLimit } from "express-rate-limit";
import { env } from "../../config/env";

export const loginRateLimit = rateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  limit: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_request, response) => {
    response.status(429).json({
      success: false,
      error: {
        code: "TOO_MANY_LOGIN_ATTEMPTS",
        message: "Çok fazla giriş denemesi yaptınız. Lütfen daha sonra tekrar deneyin",
      },
    });
  },
});

export const verificationRateLimit = rateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({
      success: false,
      error: {
        code: "TOO_MANY_VERIFICATION_ATTEMPTS",
        message: "Çok fazla doğrulama isteği yaptınız. Lütfen daha sonra tekrar deneyin",
      },
    });
  },
});
