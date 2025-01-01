import Collection from "@models/collection.model";
import User from "@models/user.model";
import { ApiError } from "@utils/ApiError";
import { Request, Response } from "express";
import mongoose from "mongoose";

export const createNewCollection = async (req: Request, res: Response) => {
  try {
    //get Collection data
    const { title, description } = req.body;
    const authorId = req.user?._id;
    //empty validation
    if (!title) {
      throw new ApiError("Title is required");
    }
    // create new collection
    const pen = await Collection.create({
      title: title,
      description: description,
      author: authorId,
    });

    //check if collection created or not
    const createdCollection = await Collection.findById(pen._id);
    if (!createdCollection) {
      throw new ApiError("Failed to create new Pen", 500);
    }

    //update the user model
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $push: { collections: createdCollection._id },
      },
      { new: true }
    );

    //sending response
    res.status(201).json(createdCollection);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(400).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Something went wrong while creating pen" });
    }
  }
};
export const getAllCollections = async (req: Request, res: Response) => {
  try {
    const collections = await Collection.find()
      .populate({
        path: "author",
        model: User,
        select: "_id name picture",
      })
      .sort({
        updatedAt: "desc",
      });
    res.status(200).json(collections);
  } catch (error) {
    // Handle other errors
    res.status(500).json({
      message: "An error occurred while retrieving collections",
      error: error,
    });
  }
};

export const getUserCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new ApiError("Invalid user id", 404);
    const collections = await Collection.find({ author: userId }).sort({
      updatedAt: "desc",
    });
    res.status(200).json(collections);
  } catch (error) {
    // Handle other errors
    res.status(500).json({
      message: "Something is wrong",
      error: error,
    });
  }
};
export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const deleteId = req.params.id;
    if (!deleteId) {
      throw new ApiError("No id provided", 400);
    }
    const deleteObjectId = new mongoose.Types.ObjectId(deleteId);
    const deletedPen = await Collection.findByIdAndDelete(deleteObjectId);
    if (!deletedPen) {
      throw new ApiError("Collection not found", 400);
    }
    res.status(204).json({ message: "Collection deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete collection",
      error: error,
    });
  }
};
export const getCurrentCollection = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new ApiError("No id provided", 400);
    }
    const idObj = new mongoose.Types.ObjectId(id);
    const collection = await Collection.findById(idObj);
    if (!collection) {
      throw new ApiError("collection not found", 400);
    }
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get collection",
      error: error,
    });
  }
};
export const makeCollectionPrivate = async (req: Request, res: Response) => {
  try {
    const updateId = req.params.id;
    if (!updateId) {
      throw new ApiError("No id provided", 400);
    }
    const updateObjectId = new mongoose.Types.ObjectId(updateId);
    const { value } = req.body;
    if (!value) {
      throw new ApiError("No type value provided", 404);
    }
    const updatedCollection = await Collection.findByIdAndUpdate(
      updateObjectId,
      {
        $set: {
          type: value,
        },
      },
      { new: true }
    );

    if (!updatedCollection) {
      throw new ApiError("Failed to update the Collection", 400);
    }
    res.status(200).json(updatedCollection);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update collection",
      error: error,
    });
  }
};
