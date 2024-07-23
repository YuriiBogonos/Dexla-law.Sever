import { Schema, Document, model } from "mongoose";

export interface IFile extends Document {
  filename: string;
  filetype: string;
  url: string;
  uploaded_at: Date;
}

const fileSchema = new Schema<IFile>({
  filename: { type: String, required: true },
  filetype: { type: String, required: true },
  url: { type: String, required: true },
  uploaded_at: { type: Date, required: true, default: Date.now },
});

export const File = model<IFile>("File", fileSchema);
