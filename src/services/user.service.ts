import { Users } from "../models/users.model";

const findUserByEmail = (email: string) => {
  return Users.findOne({ email });
};

const findUserById = (id: string) => {
  return Users.findById(id);
};

const deleteUserByEmail = (email: string) => {
  return Users.findOneAndDelete({ email });
};

export const userService = {
  findUserByEmail,
  deleteUserByEmail,
  findUserById,
};
