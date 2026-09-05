import type { Request, Response } from "express";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./auth.schemas";
import { authService } from "./auth.service";
import { authCookies, REFRESH_TOKEN_COOKIE } from "./auth.cookies";

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
    authCookies.set(response, result.accessToken, result.refreshToken);
    response.json({ success: true, data: { user: result.user } });
  },

  async refresh(request: Request, response: Response) {
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;
    if (!refreshToken) {
      response.status(401).json({ success: false, error: { code: "INVALID_REFRESH_TOKEN", message: "Refresh token bulunamadı" } });
      return;
    }
    try {
      const result = await authService.refresh(refreshToken);
      authCookies.set(response, result.accessToken, result.refreshToken);
      response.json({ success: true, message: "Oturum yenilendi" });
    } catch (error) {
      authCookies.clear(response);
      throw error;
    }
  },

  async logout(request: Request, response: Response) {
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;
    await authService.logout(refreshToken);
    authCookies.clear(response);
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
