import s3 from "../config/awsConfig";
import { v4 as uuidv4 } from "uuid";
import { IFile, File } from "../models/file.model";
import { IFolder, Folder } from "../models/folder.model";
import axios from "axios";
import * as mime from "mime-types";
import { Users } from "../models/users.model";

const allowedFileTypes = [
  "application/pdf",
  "application/msword", // doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "text/markdown", // markdown
  "application/epub+zip", // epub
  "text/plain", // txt
  "text/html", // website 
  "application/vnd.oasis.opendocument.text", // OCR 
];

export const isValidFileType = (mimetype: string) => allowedFileTypes.includes(mimetype);

export const uploadFileToS3 = async (file: { originalname: string; buffer: Buffer; mimetype: string; }) => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("Bucket name is not defined in environment variables");
  }

  const params = {
    Bucket: bucketName,
    Key: `${uuidv4()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    throw new Error("Error uploading file to S3");
  }
};

export const uploadFilesToS3 = async (files: Express.Multer.File[]) => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("Bucket name is not defined in environment variables");
  }

  const uploadPromises = files.map(file => {
    const params = {
      Bucket: bucketName,
      Key: `${uuidv4()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    return s3.upload(params).promise().then(data => data.Location);
  });

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error("Error uploading files to S3");
  }
};

export const createFolder = async (folderName: string, userEmail: string): Promise<IFolder> => {
  const user = await Users.findOne({ email: userEmail });
  if (!user) {
    throw new Error("User not found");
  }

  const folder = new Folder({ name: folderName });

  await folder.save();

  user.folders.push(folder);
  await user.save();

  return folder;
};

export const saveFileToBd = async (
  filename: string,
  filetype: string,
  url: string,
  userEmail: string,
): Promise<IFile> => {
  const newFile = new File({
    filename,
    filetype,
    url,
  });

  await newFile.save();

  const user = await Users.findOne({ email: userEmail });
  if (!user) {
    throw new Error("User not found");
  }

  const folderIds = user.folders.map(folder => folder._id);
  const folders = await Folder.find({ _id: { $in: folderIds } });
  const defaultFolder = await Folder.findOne({
    _id: folders.find(folder => folder.isDefaultFolder)?._id,
  });

  if (defaultFolder) {
    defaultFolder.files.push(newFile);
    await defaultFolder.save();
  }

  user.files.push(newFile);
  await user.save();

  return newFile;
};

export const saveFilesToBd = async (
  files: Express.Multer.File[],
  urls: string[],
  folderId: string,
  userEmail: string,
): Promise<IFile[]> => {
  const user = await Users.findOne({ email: userEmail });

  if (!user) {
    throw new Error("User not found");
  }

  const fileDocs = files.map((file, index) => ({
    filename: file.originalname,
    filetype: file.mimetype,
    url: urls[index],
    uploaded_at: new Date(),
  }));

  const newFiles = await File.insertMany(fileDocs);

  await Folder.findOneAndUpdate(
    { _id: folderId },
    { $push: { files: { $each: newFiles.map(file => file._id) } } },
    { new: true, useFindAndModify: false },
  );

  user.files.push(...newFiles);
  await user.save();

  return newFiles;
};

export const downloadFile = async (fileUrl: string) => {
  const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "binary");
  const contentType = response.headers["content-type"];
  const extension = mime.extension(contentType);
  const filename = `downloaded-file.${extension}`;

  return {
    filename, buffer,
    mimetype: contentType.split(";")[0],
  };
};
