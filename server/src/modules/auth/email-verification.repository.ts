import { db } from "../../config/database";

export type EmailTokenPurpose = "verify_email" | "change_email";

type EmailVerificationTokenRow = {
  id: string;
  user_id: string;
  email: string;
  token_hash: string;
  purpose: EmailTokenPurpose;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
};

export const emailVerificationRepository = {
  async replaceForUser(
    userId: string,
    email: string,
    tokenHash: string,
    purpose: EmailTokenPurpose,
    expiresAt: Date,
  ) {
    await db.transaction(async (transaction) => {
      await transaction<EmailVerificationTokenRow>("email_verification_tokens")
        .where({ user_id: userId, purpose, used_at: null })
        .delete();

      await transaction<EmailVerificationTokenRow>("email_verification_tokens").insert({
        user_id: userId,
        email,
        token_hash: tokenHash,
        purpose,
        expires_at: expiresAt,
      });
    });
  },

  async verify(tokenHash: string) {
    return db.transaction(async (transaction) => {
      const token = await transaction<EmailVerificationTokenRow>("email_verification_tokens")
        .where({ token_hash: tokenHash, used_at: null })
        .where("expires_at", ">", transaction.fn.now())
        .forUpdate()
        .first();

      if (!token) return undefined;

      if (token.purpose === "verify_email") {
        const updated = await transaction("users")
          .where({ id: token.user_id, email: token.email })
          .update({ email_verified_at: transaction.fn.now() });
        if (!updated) return undefined;
      } else {
        await transaction("users")
          .where({ id: token.user_id })
          .update({
            email: token.email,
            email_verified_at: transaction.fn.now(),
            token_version: transaction.raw("token_version + 1"),
          });
        await transaction("refresh_tokens").where({ user_id: token.user_id }).delete();
      }

      await transaction<EmailVerificationTokenRow>("email_verification_tokens")
        .where({ id: token.id })
        .update({ used_at: transaction.fn.now() });

      return token.purpose;
    });
  },
};
