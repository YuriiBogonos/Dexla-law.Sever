import s3 from "../config/awsConfig";
import { v4 as uuidv4 } from "uuid";
import { IFile, File } from "../models/file.model";
import { userService } from "./user.service";
import { Folder } from "../models/folder.model";

const mockEmail = "ddo2102@gmail.com";

export const uploadFileToS3 = async (file: Express.Multer.File) => {
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

export const saveFileToBd = async (
  filename: string,
  filetype: string,
  url: string,
): Promise<IFile> => {
  // const newFile = new File({
  //   filename,
  //   filetype,
  //   url,
  // });

  const newFile = new File({
    filename,
    filetype,
    url,
  });

  await newFile.save();

  const user = await userService.findUserByEmail(mockEmail);
  if (user) {
    user.folders.forEach(() => {
      // const defaultFolder = await Folder.findOne({
      //   _id: "6690ed07ad6c6e0fab1b4082",
      //   isDefaultFolder: true,
      // });
      // if (defaultFolder) {
      // defaultFolder.updateOne({ files: [newFile] });
      Folder.findOneAndUpdate(
        { _id: "6690ed07ad6c6e0fab1b4082", isDefaultFolder: true },
        {
          $push: {
            files: newFile,
          },
        },
        { new: true, useFindAndModify: false },
      );
      // defaultFolder.updateOne(
      //   { _id: "6690ed07ad6c6e0fab1b4082", isDefaultFolder: true },
      //   { $push: { files: newFile } },
      // );
      // }
    });
  }

  return await newFile.save();
};
