import { Router } from "express";
import { validate } from "../../shared/middlewares/validate";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schemas";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), authController.register);
authRouter.post("/login", validate({ body: loginSchema }), authController.login);
