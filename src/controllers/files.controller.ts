import { Request, Response } from "express";
import multer from "multer";
import { saveFileToBd, uploadFileToS3 } from "../services/files.service";
import { sendResposeMessage } from "../helpers/customError";

const upload = multer();

const uploadFile = async (req: Request, res: Response) => {
  if (!req.file) {
    return sendResposeMessage(res, "No file uploaded", 400);
  }

  try {
    const fileUrl = await uploadFileToS3(req.file);
    await saveFileToBd(req.file.originalname, req.file.mimetype, fileUrl);
    return sendResposeMessage(res, "success", 200);
    // return sendResposeMessage(res, fileUrl, 200);
  } catch (error) {
    return sendResposeMessage(res, "File upload failed", 500);
  }
};

export const filesControllers = {
  uploadFile: [upload.single("file"), uploadFile],
};
