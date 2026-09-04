import type { Request, Response } from "express";
import type {
  ForgotPasswordInput,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./auth.schemas";
import { authService } from "./auth.service";

export const authController = {
  async register(request: Request, response: Response) {
    await authService.register(request.body as RegisterInput);
    response.status(201).json({
      success: true,
      message: "Hesabınız başarıyla oluşturuldu",
    });
  },

  async login(request: Request, response: Response) {
    const result = await authService.login(request.body as LoginInput);
    response.json({ success: true, data: result });
  },

  async refresh(request: Request, response: Response) {
    const result = await authService.refresh(request.body as RefreshTokenInput);
    response.json({ success: true, data: result });
  },

  async logout(request: Request, response: Response) {
    await authService.logout(request.body as RefreshTokenInput);
    response.json({ success: true, message: "Başarıyla çıkış yapıldı" });
  },

  async verifyEmail(request: Request, response: Response) {
    const purpose = await authService.verifyEmail(request.body as VerifyEmailInput);
    response.json({
      success: true,
      message: purpose === "change_email"
        ? "E-posta adresiniz başarıyla değiştirildi"
        : "E-posta adresiniz başarıyla doğrulandı",
    });
  },

  async resendVerification(request: Request, response: Response) {
    await authService.resendVerification(request.body as ResendVerificationInput);
    response.json({
      success: true,
      message: "E-posta kayıtlı ve doğrulanmamışsa doğrulama bağlantısı gönderildi",
    });
  },

  async forgotPassword(request: Request, response: Response) {
    await authService.forgotPassword(request.body as ForgotPasswordInput);
    response.json({
      success: true,
      message: "E-posta kayıtlıysa parola sıfırlama bağlantısı gönderildi",
    });
  },

  async resetPassword(request: Request, response: Response) {
    await authService.resetPassword(request.body as ResetPasswordInput);
    response.json({ success: true, message: "Parolanız başarıyla sıfırlandı" });
  },
};
