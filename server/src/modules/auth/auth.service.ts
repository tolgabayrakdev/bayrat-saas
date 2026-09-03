import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { appError } from "../../shared/errors/app-error";
import { userRepository } from "../users/user.repository";
import type { UserRow } from "../users/user.types";
import type { LoginInput, RegisterInput } from "./auth.schemas";

const publicUser = ({ password_hash: _, ...user }: UserRow) => user;
const signToken = (userId: string) =>
  jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });

export const authService = {
  async register(input: RegisterInput) {
    if (await userRepository.findByEmail(input.email)) {
      throw appError(409, "Bu e-posta zaten kullanımda", "EMAIL_ALREADY_EXISTS");
    }

    await userRepository.create({
      name: input.name,
      email: input.email,
      password_hash: await bcrypt.hash(input.password, 12),
    });
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    const isValid = user && (await bcrypt.compare(input.password, user.password_hash));

    if (!user || !isValid) {
      throw appError(401, "E-posta veya şifre hatalı", "INVALID_CREDENTIALS");
    }

    return { user: publicUser(user), token: signToken(user.id) };
  },
};
