import { NextFunction, Request, Response } from "express";
import { sendResposeMessage } from "../helpers/customError";
import { jwtService } from "../services/jwt.service";
import { userService } from "../services/user.service";

export const authMiddlewares = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    sendResposeMessage(res, "User unauthorized", 401);
    return;
  }

  const userData = jwtService.verify(accessToken);

  if (!userData) {
    sendResposeMessage(res, "User unauthorized", 401);
    return;
  }

  try {
    const user = await userService.findUserByEmail(
      (userData as unknown as { email: string }).email,
    );

    if (!user) {
      sendResposeMessage(res, "User not found", 404);
      return;
    }

    if (user.activationCode) {
      sendResposeMessage(res, "Account is not activate", 401);
      return;
    }

    req.body.userEmail = user.email;
    req.body.userId = user.id;

    next();
  } catch (error) {
    sendResposeMessage(res, "Unable connect to DB", 500);
  }
};
