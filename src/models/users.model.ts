import { Schema, Document, model, CallbackError } from "mongoose";
import { IFolder, Folder } from "./folder.model";
import { IFile } from "./file.model";

interface IUser extends Document {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  avatarUrl?: string;
  resetPasswordCode?: number | null;
  activationCode?: number | null;
  folders: IFolder[];
  files: IFile[];
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String },
    resetPasswordCode: { type: Number, default: null },
    activationCode: { type: Number, default: null },
    folders: { type: [Schema.Types.ObjectId], ref: "Folder", default: [] },
    files: { type: [Schema.Types.ObjectId], ref: "File", default: [] },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "Users",
  },
);

// Middleware to add a default folder
userSchema.pre<IUser>("save", async function(next) {
  if (this.isNew) {
    try {
      console.log("Creating default folder for new user...");
      const defaultFolder = await Folder.create({
        isDefaultFolder: true,
        name: "SYSTEM_CONSTANT_DEFAULT_FOLDER_NAME",
        files: [],
      });

      this.folders.push(<IFolder>defaultFolder._id);
      next();
    } catch (err) {
      console.error("Error creating default folder:", err);
      next(err as CallbackError);
    }
  } else {
    next();
  }
});

export const Users = model<IUser>("User", userSchema);
