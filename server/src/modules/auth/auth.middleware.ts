import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env";
import { appError } from "../../shared/errors/app-error";

export const requireAuth: RequestHandler = (request, _response, next) => {
  const [scheme, token] = request.headers.authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    next(appError(401, "Yetkilendirme token'ı gerekli", "UNAUTHORIZED"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!payload.sub) throw new Error("Token subject eksik");
    request.auth = { userId: payload.sub };
    next();
  } catch {
    next(appError(401, "Geçersiz veya süresi dolmuş token", "INVALID_TOKEN"));
  }
};
