import { INormalizedUser, Users } from "../models/users.model";
import { User } from "../types/user";

const createUser = async (user: User): Promise<[User | null, boolean]> => {
  try {
    const existingUser = await Users.findOne({ email: user.email });

    if (existingUser) {
      return [existingUser.toObject() as User, false];
    }

    const newUser = new Users(user);
    await newUser.save();
    return [newUser.toObject() as User, true];
  } catch (error) {
    return handleUserCreationError(error);
  }
};

const normalize = (user: User & { _id: string }): INormalizedUser => {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
};

const handleUserCreationError = (error: unknown): never => {
  if (error instanceof Error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
  throw new Error("An unknown error occurred");
};

export const authService = {
  createUser,
  normalize,
};
