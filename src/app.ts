import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "@routes/user.route";
dotenv.config();

const app: Express = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//using external user routes
app.use("/api/v1/users", userRouter);
export default app;
