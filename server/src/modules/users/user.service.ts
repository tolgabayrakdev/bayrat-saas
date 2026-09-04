import bcrypt from "bcryptjs";
import { appError } from "../../shared/errors/app-error";
import { emailVerificationService } from "../auth/email-verification.service";
import { userRepository } from "./user.repository";
import type {
  DeleteAccountInput,
  RequestEmailChangeInput,
  UpdatePasswordInput,
  UpdateProfileInput,
} from "./user.schemas";
import type { PublicUser, UserRow } from "./user.types";

const toPublicUser = ({ password_hash: _, ...user }: UserRow): PublicUser => user;

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw appError(404, "Kullanıcı bulunamadı", "USER_NOT_FOUND");
    return toPublicUser(user);
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userRepository.updateProfile(userId, { name: input.name });
    if (!user) throw appError(404, "Kullanıcı bulunamadı", "USER_NOT_FOUND");
    return toPublicUser(user);
  },

  async updatePassword(userId: string, input: UpdatePasswordInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw appError(404, "Kullanıcı bulunamadı", "USER_NOT_FOUND");

    const passwordMatches = await bcrypt.compare(input.currentPassword, user.password_hash);
    if (!passwordMatches) {
      throw appError(401, "Mevcut parola hatalı", "INVALID_CURRENT_PASSWORD");
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    await userRepository.updatePasswordAndRevokeSessions(userId, passwordHash);
  },

  async requestEmailChange(userId: string, input: RequestEmailChangeInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw appError(404, "Kullanıcı bulunamadı", "USER_NOT_FOUND");

    const passwordMatches = await bcrypt.compare(input.currentPassword, user.password_hash);
    if (!passwordMatches) {
      throw appError(401, "Mevcut parola hatalı", "INVALID_CURRENT_PASSWORD");
    }
    if (user.email === input.newEmail) {
      throw appError(400, "Yeni e-posta mevcut e-postadan farklı olmalıdır", "EMAIL_NOT_CHANGED");
    }
    if (await userRepository.findByEmail(input.newEmail)) {
      throw appError(409, "Bu e-posta zaten kullanımda", "EMAIL_ALREADY_EXISTS");
    }

    await emailVerificationService.send(user, input.newEmail, "change_email");
  },

  async deleteAccount(userId: string, input: DeleteAccountInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw appError(404, "Kullanıcı bulunamadı", "USER_NOT_FOUND");

    const passwordMatches = await bcrypt.compare(input.currentPassword, user.password_hash);
    if (!passwordMatches) {
      throw appError(401, "Mevcut parola hatalı", "INVALID_CURRENT_PASSWORD");
    }

    await userRepository.deleteById(userId);
  },
};
