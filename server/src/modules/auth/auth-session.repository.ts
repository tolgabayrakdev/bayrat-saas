import { db } from "../../config/database";
import type { UserRow } from "../users/user.types";

type RefreshTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
};

export const authSessionRepository = {
  async create(userId: string, tokenHash: string, expiresAt: Date) {
    const [session] = await db<RefreshTokenRow>("refresh_tokens")
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      })
      .returning("*");
    return session;
  },

  async rotate(currentTokenHash: string, newTokenHash: string, expiresAt: Date) {
    return db.transaction(async (transaction) => {
      const currentToken = await transaction<RefreshTokenRow>("refresh_tokens")
        .where({ token_hash: currentTokenHash, revoked_at: null })
        .where("expires_at", ">", transaction.fn.now())
        .forUpdate()
        .first();

      if (!currentToken) return undefined;

      await transaction<RefreshTokenRow>("refresh_tokens")
        .where({ id: currentToken.id })
        .update({ revoked_at: transaction.fn.now() });

      const [newSession] = await transaction<RefreshTokenRow>("refresh_tokens")
        .insert({
          user_id: currentToken.user_id,
          token_hash: newTokenHash,
          expires_at: expiresAt,
        })
        .returning("*");

      const user = await transaction<UserRow>("users")
        .where({ id: currentToken.user_id })
        .first();
      return user ? { user, sessionId: newSession.id } : undefined;
    });
  },

  findActiveById(id: string, userId: string) {
    return db<RefreshTokenRow>("refresh_tokens")
      .where({ id, user_id: userId, revoked_at: null })
      .where("expires_at", ">", db.fn.now())
      .first();
  },

  revoke(tokenHash: string) {
    return db<RefreshTokenRow>("refresh_tokens")
      .where({ token_hash: tokenHash, revoked_at: null })
      .update({ revoked_at: db.fn.now() });
  },
};
