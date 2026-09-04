import { createHash, randomBytes } from "node:crypto";
import { env } from "../../config/env";
import { appError } from "../../shared/errors/app-error";
import { mailService } from "../../shared/services/mail.service";
import type { UserRow } from "../users/user.types";
import {
  emailVerificationRepository,
  type EmailTokenPurpose,
} from "./email-verification.repository";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const emailVerificationService = {
  async send(user: UserRow, email: string, purpose: EmailTokenPurpose) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + env.EMAIL_VERIFICATION_EXPIRES_MINUTES * 60 * 1000,
    );

    await emailVerificationRepository.replaceForUser(
      user.id,
      email,
      hashToken(token),
      purpose,
      expiresAt,
    );

    try {
      await mailService.sendEmailVerification(email, token);
    } catch (error) {
      console.error("E-posta doğrulama bağlantısı gönderilemedi", error);
    }
  },

  async verify(token: string) {
    const purpose = await emailVerificationRepository.verify(hashToken(token));
    if (!purpose) {
      throw appError(
        400,
        "E-posta doğrulama bağlantısı geçersiz veya süresi dolmuş",
        "INVALID_EMAIL_VERIFICATION_TOKEN",
      );
    }
    return purpose;
  },
};
