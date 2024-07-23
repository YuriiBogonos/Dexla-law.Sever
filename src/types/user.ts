import { IFolder } from "../models/folder.model";
import { IFile } from "../models/file.model";

export type User = {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  avatarUrl?: string;
  resetPasswordCode?: number | null;
  activationCode?: number | null;
  folders: IFolder[];
  files: IFile[];
};
