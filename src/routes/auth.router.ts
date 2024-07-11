import express from "express";
import { authControllers } from "../controllers/auth.controller";
import { authMiddlewares } from "../middlewares/authMiddlewares";

export const authRouter = express.Router();

authRouter.post("/registration", authControllers.register);
authRouter.post("/checkActivationCode", authControllers.checkActivationCode);
authRouter.post("/activation", authControllers.activate);
authRouter.post("/resendActivationCode", authControllers.resendActivationCode);
authRouter.post("/login", authControllers.login);
authRouter.post(
  "/sendResetPasswordCode",
  authControllers.sendResetPasswordCode,
);
authRouter.post(
  "/checkResetPasswordCode",
  authControllers.checkResetPasswordCode,
);
authRouter.post(
  "/resendResetPasswordCode",
  authControllers.resendResetPasswordCode,
);
authRouter.post("/resetPassword", authControllers.resetPassword);
authRouter.post(
  "/changePassword",
  authMiddlewares,
  authControllers.changePassword,
);
