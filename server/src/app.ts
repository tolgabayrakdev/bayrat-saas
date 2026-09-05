import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { userRouter } from "./modules/users/user.routes";
import { subscriptionRouter } from "./modules/subscriptions/subscription.routes";
import { errorHandler } from "./shared/middlewares/error-handler";
import { notFound } from "./shared/middlewares/not-found";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(morgan("dev"));

app.get("/health", (_request, response) => {
  response.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/subscriptions", subscriptionRouter);

app.use(notFound);
app.use(errorHandler);
