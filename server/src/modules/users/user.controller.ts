import type { Request, Response } from "express";
import { userService } from "./user.service";

export const userController = {
  async getMe(request: Request, response: Response) {
    const user = await userService.getProfile(request.auth!.userId);
    response.json({ success: true, data: user });
  },
};
