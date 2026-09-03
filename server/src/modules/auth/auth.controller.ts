import type { Request, Response } from "express";
import type { LoginInput, RegisterInput } from "./auth.schemas";
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
};
