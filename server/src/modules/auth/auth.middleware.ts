import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env";
import { appError } from "../../shared/errors/app-error";
import { userRepository } from "../users/user.repository";
import { authSessionRepository } from "./auth-session.repository";
import { ACCESS_TOKEN_COOKIE } from "./auth.cookies";

export const requireAuth: RequestHandler = async (request, _response, next) => {
  const token = request.cookies[ACCESS_TOKEN_COOKIE] as string | undefined;

  if (!token) {
    next(appError(401, "Yetkilendirme token'ı gerekli", "UNAUTHORIZED"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (
      !payload.sub ||
      typeof payload.sessionId !== "string" ||
      typeof payload.tokenVersion !== "number"
    ) {
      throw new Error("Token bilgileri eksik");
    }

    const [user, session] = await Promise.all([
      userRepository.findById(payload.sub),
      authSessionRepository.findActiveById(payload.sessionId, payload.sub),
    ]);
    if (!user || !session || user.token_version !== payload.tokenVersion) {
      throw new Error("Token iptal edilmiş");
    }

    request.auth = { userId: payload.sub };
    next();
  } catch {
    next(appError(401, "Geçersiz veya süresi dolmuş token", "INVALID_TOKEN"));
  }
};
