import { db } from "../../config/database";
import type { UserRow } from "./user.types";

export const userRepository = {
  findByEmail: (email: string) =>
    db<UserRow>("users").where({ email }).first(),

  findById: (id: string) =>
    db<UserRow>("users").where({ id }).first(),

  async create(data: Pick<UserRow, "name" | "email" | "password_hash">) {
    return db.transaction(async (transaction) => {
      const [user] = await transaction<UserRow>("users").insert(data).returning("*");
      const freePlan = await transaction("plans").where({ code: "free", active: true }).first("id");

      if (!freePlan) throw new Error("Free plan bulunamadı");
      await transaction("subscriptions").insert({ user_id: user.id, plan_id: freePlan.id });
      return user;
    });
  },

  async updatePasswordAndRevokeSessions(id: string, passwordHash: string) {
    await db.transaction(async (transaction) => {
      await transaction<UserRow>("users")
        .where({ id })
        .update({
          password_hash: passwordHash,
          token_version: transaction.raw("token_version + 1"),
        });
      await transaction("refresh_tokens").where({ user_id: id }).delete();
    });
  },

  async updateProfile(id: string, data: Pick<UserRow, "name">) {
    const [user] = await db<UserRow>("users")
      .where({ id })
      .update(data)
      .returning("*");
    return user;
  },

  deleteById: (id: string) => db<UserRow>("users").where({ id }).delete(),
};
