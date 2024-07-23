import { Schema, Document, model } from "mongoose";

export interface IFile extends Document {
  file_id: Schema.Types.ObjectId;
  filename: string;
  filetype: string;
  url: string;
  uploaded_at: Date;
}

const fileSchema = new Schema<IFile>({
  file_id: { type: Schema.Types.ObjectId, required: true },
  filename: { type: String, required: true },
  filetype: { type: String, required: true },
  url: { type: String, required: true },
  uploaded_at: { type: Date, required: true },
});

export const File = model<IFile>("File", fileSchema);
