import express from "express";
import { filesControllers } from "../controllers/files.controller";
import { authMiddlewares } from "../middlewares/authMiddlewares";

export const filesRouter = express.Router();

filesRouter.post("/upload", authMiddlewares, filesControllers.uploadFile);
filesRouter.post("/uploadFolder", authMiddlewares, filesControllers.uploadFolder);
filesRouter.post("/uploadByUrl", authMiddlewares, filesControllers.uploadFileByUrl);
