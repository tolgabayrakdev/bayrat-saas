import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { appError } from "../../shared/errors/app-error";
import { mailService } from "../../shared/services/mail.service";
import { userRepository } from "../users/user.repository";
import type { PublicUser, UserRow } from "../users/user.types";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./auth.schemas";
import { authSessionRepository } from "./auth-session.repository";
import { emailVerificationService } from "./email-verification.service";
import { passwordResetRepository } from "./password-reset.repository";

const publicUser = ({ password_hash: _, token_version: __, ...user }: UserRow): PublicUser => user;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const signAccessToken = (user: UserRow, sessionId: string) =>
  jwt.sign({ sub: user.id, sessionId, tokenVersion: user.token_version }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
const refreshTokenExpiry = () =>
  new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

export const authService = {
  async register(input: RegisterInput) {
    if (await userRepository.findByEmail(input.email)) {
      throw appError(409, "Bu e-posta zaten kullanımda", "EMAIL_ALREADY_EXISTS");
    }

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password_hash: await bcrypt.hash(input.password, 12),
    });
    await emailVerificationService.send(user, user.email, "verify_email");
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    const isValid = user && (await bcrypt.compare(input.password, user.password_hash));

    if (!user || !isValid) {
      throw appError(401, "E-posta veya şifre hatalı", "INVALID_CREDENTIALS");
    }
    if (!user.email_verified_at) {
      throw appError(403, "Giriş yapmadan önce e-posta adresinizi doğrulayın", "EMAIL_NOT_VERIFIED");
    }

    const refreshToken = randomBytes(32).toString("hex");
    const session = await authSessionRepository.create(
      user.id,
      hashToken(refreshToken),
      refreshTokenExpiry(),
    );

    return {
      user: publicUser(user),
      accessToken: signAccessToken(user, session.id),
      refreshToken,
    };
  },

  async refresh(refreshToken: string) {
    const newRefreshToken = randomBytes(32).toString("hex");
    const session = await authSessionRepository.rotate(
      hashToken(refreshToken),
      hashToken(newRefreshToken),
      refreshTokenExpiry(),
    );

    if (!session) {
      throw appError(401, "Geçersiz veya süresi dolmuş refresh token", "INVALID_REFRESH_TOKEN");
    }

    return {
      accessToken: signAccessToken(session.user, session.sessionId),
      refreshToken: newRefreshToken,
    };
  },

  async logout(refreshToken?: string) {
    if (refreshToken) await authSessionRepository.revoke(hashToken(refreshToken));
  },

  async verifyEmail(input: VerifyEmailInput) {
    return emailVerificationService.verify(input.token);
  },

  async resendVerification(input: ResendVerificationInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || user.email_verified_at) return;
    await emailVerificationService.send(user, user.email, "verify_email");
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) return;

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await passwordResetRepository.replaceForUser(user.id, hashToken(token), expiresAt);
    try {
      await mailService.sendPasswordReset(user.email, token);
    } catch (error) {
      console.error("Parola sıfırlama e-postası gönderilemedi", error);
    }
  },

  async resetPassword(input: ResetPasswordInput) {
    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    const wasReset = await passwordResetRepository.resetPassword(
      hashToken(input.token),
      passwordHash,
    );

    if (!wasReset) {
      throw appError(
        400,
        "Parola sıfırlama bağlantısı geçersiz veya süresi dolmuş",
        "INVALID_RESET_TOKEN",
      );
    }
  },
};
