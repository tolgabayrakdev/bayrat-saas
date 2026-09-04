import nodemailer from "nodemailer";
import { env } from "../../config/env";

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: env.SMTP_USER
    ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
    : undefined,
});

export const mailService = {
  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

    await transport.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: "Parolanızı sıfırlayın",
      text: `Parolanızı sıfırlamak için bu bağlantıyı kullanın: ${resetUrl}\n\nBu bağlantı 15 dakika geçerlidir.`,
    });
  },

  async sendEmailVerification(email: string, token: string) {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

    await transport.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: "E-posta adresinizi doğrulayın",
      text: `E-posta adresinizi doğrulamak için bu bağlantıyı kullanın: ${verificationUrl}\n\nBu bağlantı ${env.EMAIL_VERIFICATION_EXPIRES_MINUTES} dakika geçerlidir.`,
    });
  },
};
