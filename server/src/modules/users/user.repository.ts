import { db } from "../../config/database";
import type { UserRow } from "./user.types";

export const userRepository = {
  findByEmail: (email: string) =>
    db<UserRow>("users").where({ email }).first(),

  findById: (id: string) =>
    db<UserRow>("users").where({ id }).first(),

  async create(data: Pick<UserRow, "name" | "email" | "password_hash">) {
    const [user] = await db<UserRow>("users").insert(data).returning("*");
    return user;
  },
};
