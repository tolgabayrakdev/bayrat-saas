import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../../config/env";
import { isAppError } from "../errors/app-error";

const isPostgresError = (
  error: unknown,
): error is Error & { code: string; constraint?: string } =>
  error instanceof Error &&
  "code" in error &&
  typeof error.code === "string";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Geçersiz istek", details: error.flatten() },
    });
    return;
  }

  if (isAppError(error)) {
    response.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message },
    });
    return;
  }

  if (isPostgresError(error) && error.code === "23505") {
    const isEmailConflict = error.constraint === "users_email_unique";

    response.status(409).json({
      success: false,
      error: {
        code: isEmailConflict ? "EMAIL_ALREADY_EXISTS" : "RESOURCE_ALREADY_EXISTS",
        message: isEmailConflict
          ? "Bu e-posta zaten kullanımda"
          : "Bu kayıt zaten mevcut",
      },
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "production" ? "Beklenmeyen bir hata oluştu" : String(error),
    },
  });
};
