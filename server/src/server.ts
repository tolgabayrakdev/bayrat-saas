import "dotenv/config";
import { app } from "./app";
import { db } from "./config/database";
import { env } from "./config/env";

const server = app.listen(env.PORT, () => {
  console.log(`API http://localhost:${env.PORT} adresinde çalışıyor`);
});

const shutdown = async () => {
  server.close(async () => {
    await db.destroy();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
