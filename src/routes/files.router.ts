import express from "express";
import { filesControllers } from "../controllers/files.controller";

export const filesRouter = express.Router();

filesRouter.post("/upload", filesControllers.uploadFile);
filesRouter.post("/uploadFolder", filesControllers.uploadFolder);
filesRouter.post("/uploadByUrl", filesControllers.uploadFileByUrl);
