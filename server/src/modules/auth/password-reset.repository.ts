import { db } from "../../config/database";

type PasswordResetTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
};

export const passwordResetRepository = {
  async replaceForUser(userId: string, tokenHash: string, expiresAt: Date) {
    await db.transaction(async (transaction) => {
      await transaction<PasswordResetTokenRow>("password_reset_tokens")
        .where({ user_id: userId, used_at: null })
        .delete();

      await transaction<PasswordResetTokenRow>("password_reset_tokens").insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });
    });
  },

  async resetPassword(tokenHash: string, passwordHash: string) {
    return db.transaction(async (transaction) => {
      const token = await transaction<PasswordResetTokenRow>("password_reset_tokens")
        .where({ token_hash: tokenHash, used_at: null })
        .where("expires_at", ">", transaction.fn.now())
        .forUpdate()
        .first();

      if (!token) return false;

      await transaction("users")
        .where({ id: token.user_id })
        .update({
          password_hash: passwordHash,
          token_version: transaction.raw("token_version + 1"),
        });

      await transaction("refresh_tokens").where({ user_id: token.user_id }).delete();

      await transaction<PasswordResetTokenRow>("password_reset_tokens")
        .where({ id: token.id })
        .update({ used_at: transaction.fn.now() });

      return true;
    });
  },
};
