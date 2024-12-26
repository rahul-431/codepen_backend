import {
  deleteUser,
  getAllUsers,
  getCurrentUser,
  loginUser,
  logout,
  refreshAccessToken,
  registerUser,
  updateUser,
} from "@controllers/user.controller";
import { verifyJwt } from "@middlewares/auth.middlware";
import { Router } from "express";

const userRouter = Router();

//user registration
userRouter.route("/").post(registerUser);

//get all users
userRouter.route("/").get(getAllUsers);

//user login
userRouter.route("/login").post(loginUser);

//secured routes

//get list of all users
// userRouter.route("/").get(verifyJwt, getAllUsers);
userRouter.route("/getCurrent").get(verifyJwt, getCurrentUser);

//delete user
userRouter.route("/:id").delete(verifyJwt, deleteUser);

//update user data fullName and email
userRouter.route("/").put(verifyJwt, updateUser);

//logout user
userRouter.route("/logout").post(verifyJwt, logout);

userRouter.route("/refresh").post(refreshAccessToken);
export default userRouter;
