import { Schema, Document, model } from "mongoose";
import { IFile } from "./file.model";

export interface IFolder extends Document {
  isDefaultFolder: boolean;
  name: string;
  files: IFile[];
}

const folderSchema = new Schema<IFolder>({
  name: { type: String, required: true },
  isDefaultFolder: { type: Boolean, required: true, default: false },
  files: { type: [Schema.Types.ObjectId], ref: "File", default: [] },
});

export const Folder = model<IFolder>("Folder", folderSchema);
