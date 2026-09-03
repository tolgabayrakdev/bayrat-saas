import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../../config/env";
import { isAppError } from "../errors/app-error";

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

  console.error(error);
  response.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "production" ? "Beklenmeyen bir hata oluştu" : String(error),
    },
  });
};
