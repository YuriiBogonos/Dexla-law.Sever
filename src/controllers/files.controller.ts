import { Response } from "express";
import {
  downloadFile,
  uploadFileToS3,
  saveFileToBd,
  createFolder,
  uploadFilesToS3,
  saveFilesToBd, isValidFileType,
} from "../services/files.service";
import { sendResposeMessage } from "../helpers/customError";
import multer from "multer";
import { Request } from "express";

const upload = multer();

const uploadFile = async (req: Request, res: Response) => {
  if (!req.file) {
    return sendResposeMessage(res, "No file uploaded", 400);
  }

  if (!isValidFileType(req.file.mimetype)) {
    return sendResposeMessage(res, "Invalid file type", 400);
  }

  try {
    const fileUrl = await uploadFileToS3(req.file);
    await saveFileToBd(req.file.originalname, req.file.mimetype, fileUrl, req.body.userEmail);
    return sendResposeMessage(res, "success", 200);
  } catch (error) {
    return sendResposeMessage(res, "File upload failed", 500);
  }
};

const uploadFolder = async (req: Request, res: Response) => {
  const { folderName } = req.body;

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return sendResposeMessage(res, "No files uploaded", 400);
  }

  const invalidFiles = (req.files as Express.Multer.File[]).filter(file => !isValidFileType(file.mimetype));
  if (invalidFiles.length > 0) {
    return sendResposeMessage(res, "One or more files have invalid file types", 400);
  }

  try {
    const folder = await createFolder(folderName, req.body.userEmail);
    const fileUrls = await uploadFilesToS3(req.files);
    await saveFilesToBd(req.files, fileUrls, <string>folder._id, req.body.userEmail);
    return sendResposeMessage(res, "success", 200);
  } catch (error) {
    return sendResposeMessage(res, "Folder upload failed", 500);
  }
};

const uploadFileByUrl = async (req: Request, res: Response) => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    return sendResposeMessage(res, "No URL provided", 400);
  }

  try {
    const { filename, mimetype, buffer } = await downloadFile(fileUrl);

    if (!isValidFileType(mimetype)) {
      return sendResposeMessage(res, "Invalid file type", 400);
    }

    const s3Url = await uploadFileToS3({ originalname: filename, mimetype, buffer });
    await saveFileToBd(filename, mimetype, s3Url, req.body.userEmail);
    return sendResposeMessage(res, "success", 200);
  } catch (error) {
    return sendResposeMessage(res, "File upload by URL failed", 500);
  }
};

export const filesControllers = {
  uploadFile: [upload.single("file"), uploadFile],
  uploadFolder: [upload.array("files"), uploadFolder],
  uploadFileByUrl,
};
