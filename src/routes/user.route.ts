import { Router } from "express";

const userRouter = Router();

//user registration
userRouter.route("/").post();

//user login
userRouter.route("/login").post();
export default userRouter;
