import type { Request, Response } from "express";
import type {
  DeleteAccountInput,
  RequestEmailChangeInput,
  UpdatePasswordInput,
  UpdateProfileInput,
} from "./user.schemas";
import { userService } from "./user.service";

export const userController = {
  async getMe(request: Request, response: Response) {
    const user = await userService.getProfile(request.auth!.userId);
    response.json({ success: true, data: user });
  },

  async updateProfile(request: Request, response: Response) {
    const user = await userService.updateProfile(
      request.auth!.userId,
      request.body as UpdateProfileInput,
    );
    response.json({
      success: true,
      message: "Profiliniz başarıyla güncellendi",
      data: user,
    });
  },

  async updatePassword(request: Request, response: Response) {
    await userService.updatePassword(
      request.auth!.userId,
      request.body as UpdatePasswordInput,
    );
    response.json({ success: true, message: "Parolanız başarıyla güncellendi" });
  },

  async requestEmailChange(request: Request, response: Response) {
    await userService.requestEmailChange(
      request.auth!.userId,
      request.body as RequestEmailChangeInput,
    );
    response.json({
      success: true,
      message: "Yeni e-posta adresinize doğrulama bağlantısı gönderildi",
    });
  },

  async deleteAccount(request: Request, response: Response) {
    await userService.deleteAccount(
      request.auth!.userId,
      request.body as DeleteAccountInput,
    );
    response.json({ success: true, message: "Hesabınız başarıyla silindi" });
  },
};
