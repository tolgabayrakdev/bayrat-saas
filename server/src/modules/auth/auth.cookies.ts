import type { Response } from "express";
import { env } from "../../config/env";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const sharedOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export const authCookies = {
  set(response: Response, accessToken: string, refreshToken: string) {
    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...sharedOptions, path: "/" });
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...sharedOptions,
      path: "/api/auth",
      maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });
  },

  clear(response: Response) {
    response.clearCookie(ACCESS_TOKEN_COOKIE, { ...sharedOptions, path: "/" });
    response.clearCookie(REFRESH_TOKEN_COOKIE, { ...sharedOptions, path: "/api/auth" });
  },
};
