import cors from "cors";
import express from "express";
import morgan from "morgan";
import { authRouter } from "./modules/auth/auth.routes";
import { userRouter } from "./modules/users/user.routes";
import { errorHandler } from "./shared/middlewares/error-handler";
import { notFound } from "./shared/middlewares/not-found";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_request, response) => {
  response.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.use(notFound);
app.use(errorHandler);
