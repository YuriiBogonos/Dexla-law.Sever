import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { connectToDB } from "./utils/db";
import { authRouter } from "./routes/auth.router";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  }),
);
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", true);

app.use(authRouter);

connectToDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
