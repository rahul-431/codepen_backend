import User from "@models/user.model";
import { ApiError } from "@utils/ApiError";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend the Request interface to include the user property
declare module "express-serve-static-core" {
  interface Request {
    user?: typeof User.prototype; // Adjust type as per your User model
  }
}

const verifyJwt = async (req: Request, _: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError("Unauthorized access", 401);
    }

    // Ensure token has the correct structure
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new ApiError("JWT malformed", 403);
    }

    const decodedToken: JwtPayload | "" | undefined =
      process.env.ACCESS_TOKEN_SECRET &&
      (jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as JwtPayload);
    const user =
      decodedToken !== "" &&
      (await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
      ));
    if (!user) {
      throw new ApiError("Invalid Access token", 401);
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("token verification failed", error);
    next(new ApiError("Failed ot validate the user", 401));
  }
};
export { verifyJwt };
