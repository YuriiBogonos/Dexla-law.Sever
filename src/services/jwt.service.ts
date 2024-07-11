import jwt from "jsonwebtoken";
import "dotenv/config";
import { User } from "../types/user";

const sign = (user: Partial<User>) => {
  const token = jwt.sign(user, (process.env.JWT_CODE || ""), {expiresIn: "30d"});

  return token;
};

const verify = (token: string) => {
  try {
    const decoded = jwt.verify(token, (process.env.JWT_CODE || ""));
  
    return decoded;
  } catch {
    return null;
  }
};

export const jwtService = {
  sign,
  verify
};
