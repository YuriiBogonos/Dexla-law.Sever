import { Request, Response } from "express";
import bcrypt from "bcrypt";
import "dotenv/config";
import { sendResposeMessage } from "../helpers/customError";
import { authService } from "../services/auth.service";
import { generateActivationCode } from "../helpers/generateActivationCode";
import { getActivationMessage } from "../helpers/email/getActivationMessage";
import { emailService } from "../services/email.service";
import { jwtService } from "../services/jwt.service";
import { userService } from "../services/user.service";
import { validateEmail } from "../helpers/validateEmail";
import { validatePassword } from "../helpers/validatePassword";
import { getResetPasswordMessage } from "../helpers/email/getResetPasswordMessage";

const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    sendResposeMessage(res, "All fields are required", 400);
    return;
  }

  const emailValidation = validateEmail(email);
  if (emailValidation) {
    sendResposeMessage(res, emailValidation, 400);
    return;
  }

  const passwordValidation = validatePassword(password);
  if (passwordValidation) {
    sendResposeMessage(res, passwordValidation, 400);
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_CODE || 12),
    );

    const activationCode = generateActivationCode();

    const [, isCreated] = await authService.createUser({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      activationCode,
      avatarUrl: undefined,
      resetPasswordCode: null,
      folders: [],
      files: [],
    });

    if (!isCreated) {
      sendResposeMessage(res, "User already exists", 409);
      return;
    }

    const html = getActivationMessage(firstName, activationCode);
    await emailService.sendMail({ email, html, subject: "Account activation" });

    console.log("Activation email sent.");
    sendResposeMessage(res, "Activation code sent to email", 201);
  } catch (e) {
    console.error("Error during user registration:", e);
    sendResposeMessage(res, "Unable to connect to DB", 500);
  }
};
const checkActivationCode = async (req: Request, res: Response) => {
  const { email, activationCode } = req.body;

  if (!email) {
    sendResposeMessage(res, "Email is required", 400);
    return;
  }

  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      sendResposeMessage(res, "User not found", 404);
      return;
    }

    if (user.activationCode === activationCode) {
      res.status(200).send({ isValid: true });
    } else {
      res.status(400).send({ isValid: false });
    }
  } catch (error) {
    sendResposeMessage(res, "Unable to connect to DB", 500);
  }
};

const activate = async (req: Request, res: Response) => {
  const { email, activationCode } = req.body;

  if (!email) {
    sendResposeMessage(res, "Email is required", 400);
    return;
  }

  if (activationCode.length < 6) {
    sendResposeMessage(res, "Invalid activation code", 400);
    return;
  }

  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      sendResposeMessage(res, "User not found", 404);
      return;
    }

    if (user.activationCode !== activationCode) {
      sendResposeMessage(res, "Invalid activation code", 400);
      return;
    } else {
      user.activationCode = null;
      await user.save();

      const accessToken = jwtService.sign({ email: user.email });
      const normalizedUser = authService.normalize(user.toObject());

      res.cookie("accessToken", accessToken, {
        secure: true,
        sameSite: "none",
      });
      res.status(201);
      res.send({
        ...normalizedUser,
        accessToken,
      });
    }
  } catch (error) {
    sendResposeMessage(res, "Unable to connect to DB", 500);
  }
};

const resendActivationCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    sendResposeMessage(res, "Email is required", 400);
    return;
  }

  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      sendResposeMessage(res, "User not found", 404);
      return;
    }

    if (!user.activationCode) {
      sendResposeMessage(res, "User already activated", 400);
      return;
    }

    const html = getActivationMessage(user.firstName, user.activationCode);
    emailService.sendMail({ email, html, subject: "Account activation" });

    sendResposeMessage(res, "Activation code resent to email", 201);
  } catch {
    sendResposeMessage(res, "Unable to connect to DB", 500);
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email) {
    sendResposeMessage(res, "Email is required", 400);
    return;
  }

  if (!password) {
    sendResposeMessage(res, "Password is required", 400);
    return;
  }

  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      sendResposeMessage(res, "User does not exist", 404);
      return;
    }

    if (user.activationCode) {
      sendResposeMessage(res, "User is not activated", 400);
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      sendResposeMessage(res, "Invalid password", 400);
      return;
    }

    const normalizedUser = authService.normalize(user.toObject());
    const accessToken = jwtService.sign({ email: user.email });

    res.cookie("accessToken", accessToken, {
      secure: true,
      sameSite: "none",
    });
    res.status(201);
    res.send({
      ...normalizedUser,
      accessToken,
    });
  } catch (error) {
    sendResposeMessage(res, "Unable to connect to DB", 500);
  }
};

const sendResetPasswordCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    sendResposeMessage(res, "Email is required", 400);
    return;
  }

  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      sendResposeMessage(res, "User does not exist", 404);
      return;
    }

    if (user.activationCode) {
      sendResposeMessage(res, "User is not activated", 400);
      return;
    }

    const resetCode = generateActivationCode();
    const html = getResetPasswordMessage(resetCode);

    emailService.sendMail({ email, html, subject: "Reset password" });

    user.resetPasswordCode = resetCode;
    await user.save();

    sendResposeMessage(res, "Reset password code sent to email", 200);
  } catch (error) {
    sendResposeMessage(res, "Unable to connect to DB", 500);
  }
};

const resendResetPasswordCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    sendResposeMessage(res, "Email is required", 400);
    return;
  }

  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      sendResposeMessage(res, "User not found", 404);
      return;
    }

    if (!user.resetPasswordCode) {
      sendResposeMessage(res, "User does not have reset password code", 400);
      return;
    }

    const html = getResetPasswordMessage(user.resetPasswordCode);
    emailService.sendMail({ email, html, subject: "Reset password" });

    sendResposeMessage(res, "Reset password code resent to email", 201);
  } catch {
    sendResposeMessage(res, "Unable to connect to DB", 500);
  }
};

const checkResetPasswordCode = async (req: Request, res: Response) => {
  const { email, resetPasswordCode } = req.body;

  if (!email) {
    sendResposeMessage(res, "Email is required", 400);
    return;
  }

  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      sendResposeMessage(res, "User does not exist", 404);
      return;
    }

    if (user.resetPasswordCode !== resetPasswordCode) {
      sendResposeMessage(res, "Invalid reset password code", 400);
      return;
    }

    sendResposeMessage(res, "Reset password code is valid", 200);
  } catch (error) {
    sendResposeMessage(res, "Unable to connect to DB", 500);
  }
};

const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword, resetPasswordCode } = req.body;

  if (!email) {
    sendResposeMessage(res, "Email is required", 400);
    return;
  }

  const isValidNewPassword = validatePassword(newPassword);

  if (isValidNewPassword) {
    sendResposeMessage(res, "New password is not valid", 400);
    return;
  }

  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      sendResposeMessage(res, "User does not exist", 404);
      return;
    }

    if (user.resetPasswordCode !== resetPasswordCode) {
      sendResposeMessage(res, "Invalid reset password code", 400);
      return;
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.SALT_CODE || 12),
    );

    user.password = hashedPassword;
    user.resetPasswordCode = null;
    await user.save();

    const accessToken = jwtService.sign({ email: user.email });
    const normalizedUser = authService.normalize(user.toObject());

    res.cookie("accessToken", accessToken, {
      secure: true,
      sameSite: "none",
    });
    res.status(201);
    res.send({
      ...normalizedUser,
      accessToken,
    });
  } catch (error) {
    sendResposeMessage(res, "Unable to connect to DB", 500);
  }
};

const changePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword, email } = req.body;

  if (!email) {
    sendResposeMessage(res, "Email is required", 400);
    return;
  }

  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      sendResposeMessage(res, "User does not exist", 404);
      return;
    }

    if (user.activationCode) {
      sendResposeMessage(res, "User is not activated", 400);
      return;
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      sendResposeMessage(res, "Old password is wrong", 400);
      return;
    }

    const isValidNewPassword = validatePassword(newPassword);

    if (isValidNewPassword) {
      sendResposeMessage(res, "New password is not valid", 400);
      return;
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.SALT_CODE || 12),
    );

    user.password = hashedPassword;
    await user.save();

    sendResposeMessage(res, "Password changed successfully", 200);
  } catch (error) {
    sendResposeMessage(res, "Unable to connect to DB", 500);
  }
};

export const authControllers = {
  register,
  activate,
  login,
  sendResetPasswordCode,
  checkResetPasswordCode,
  resetPassword,
  changePassword,
  resendActivationCode,
  resendResetPasswordCode,
  checkActivationCode,
};
