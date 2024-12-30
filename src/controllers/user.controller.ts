import User from "@models/user.model";
import { ApiError } from "@utils/ApiError";
import { ApiResponse } from "@utils/ApiResponse";
import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
interface RegisterProp {
  name: string;
  email: string;
  password: string;
}
export const registerUser = async (
  req: Request<{}, {}, RegisterProp>,
  res: Response
): Promise<void> => {
  console.log("hited");
  try {
    //get user data
    const { name, email, password } = req.body;

    //empty validation
    if ([name, email, password].some((item) => item?.trim() === "")) {
      throw new ApiError("All Fields are required");
    }

    //check if the user with email already exist or not
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      throw new ApiError(
        `User with ${email} already exist, please try new one`,
        409
      );
    }
    //creating user and add entry in db
    const user = await User.create({
      name,
      email,
      password,
    });

    //check if user is successfully created or not
    // const createdUser = await User.findById(user._id).select("-password");
    const createdUser = await User.findById(user._id);
    if (!createdUser) {
      throw new ApiError("Failed to create a new user", 500);
    }

    // sending the response back to the user
    res.status(201).json("User registered successfully");
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
};
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find().select("-password -refreshToken");

    res.status(200).json(users);
  } catch (error) {
    // Handle other errors
    res.status(500).json({
      error: "An error occurred while retrieving users",
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    //get user data
    const { email, password } = req.body;

    //empty validation
    if (!email || !password) {
      throw new ApiError("All Fields are required", 400);
    }

    //check if user exist or not
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User does not exist");
    }

    //checking password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError("Password is incorrect, please try again", 400);
    }

    //generating access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    //sending access token in cookie
    //after adding this option true then cookie can not be modified by the client side
    // so we must need to set these options true while sending cookie
    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ user: loggedInUser, token: { accessToken, refreshToken } });
  } catch (error) {
    console.log("Failed to login: ", error);
    throw new Error("Failed to login");
  }
};

export const generateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;

    //save refresh token to database
    await user.save({ validateBeforeSave: false });
    console.log(accessToken, refreshToken);
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError("something went wrong while creating jwt tokens", 500);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await User.findById(req.user?._id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  res.json(user);
};
//logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: "" },
    },
    /*This new option tells Mongoose to return the 
    updated document after the update operation is completed.
     Without this option, Mongoose would return the document as it was before the update. */
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse({}, "User Logged out successfully"));
};
export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError("Unauthorized request", 401);
  }
  const parts = incomingRefreshToken.split(".");
  if (parts.length !== 3) {
    throw new ApiError("JWT malformed", 401);
  }
  try {
    const decodedToken: JwtPayload | undefined | "" =
      process.env.REFRESH_TOKEN_SECRET &&
      (jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      ) as JwtPayload);
    const user = decodedToken && (await User.findById(decodedToken._id));
    if (!user) {
      throw new ApiError("Invalid refresh token", 401);
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError("Refresh token is expired or used", 401);
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          { newAccessToken, newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error: any) {
    throw new ApiError(error?.message || "Invalid refresh token", 401);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const deleteId = req.params.id;
  if (!deleteId) {
    throw new ApiError("No id provided", 400);
  }
  const deleteObjectId = new mongoose.Types.ObjectId(deleteId);
  const deletedUser = await User.findByIdAndDelete(deleteObjectId);
  if (!deletedUser) {
    throw new ApiError("use not found", 400);
  }
  res.status(204).json("User deleted successfully");
};

//updating the user details email and fullName
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new ApiError("Name and email is required", 400);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        name: name,
        email: email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError("Failed to update the user", 400);
  }
  res.status(200).json(new ApiResponse(updatedUser, "Updated successfully"));
};
