import { appError } from "../../shared/errors/app-error";
import { userRepository } from "./user.repository";
import type { PublicUser, UserRow } from "./user.types";

const toPublicUser = ({ password_hash: _, ...user }: UserRow): PublicUser => user;

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw appError(404, "Kullanıcı bulunamadı", "USER_NOT_FOUND");
    return toPublicUser(user);
  },
};
