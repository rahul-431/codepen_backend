import Collection from "@models/collection.model";
import Pen from "@models/pen.model";
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
    const collections = await Collection.find({
      type: "public",
      deleted: false,
    })
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
    const collections = await Collection.find({
      author: userId,
      deleted: false,
    }).sort({
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
export const getTempDeltedCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new ApiError("Invalid user id", 404);
    const collections = await Collection.find({
      author: userId,
      deleted: true,
    }).sort({
      updatedAt: "desc",
    });
    console.log("delted collections:", collections);
    res.status(200).json(collections);
  } catch (error) {
    // Handle other errors
    res.status(500).json({
      message: "Something is wrong",
      error: error,
    });
  }
};
//temporarily deleting collection
export const deleteCollectionTemp = async (req: Request, res: Response) => {
  try {
    const updateId = req.params.id;
    if (!updateId) {
      throw new ApiError("No id provided", 400);
    }
    const updateObjectId = new mongoose.Types.ObjectId(updateId);
    const updatedCollection = await Collection.findByIdAndUpdate(
      updateObjectId,
      {
        $set: {
          deleted: true,
        },
      },
      { new: true }
    );

    if (!updatedCollection) {
      throw new ApiError("Failed to delete collection temporarily", 400);
    }
    res.status(200).json(updatedCollection);
  } catch (error) {
    res.status(500).json({
      message: "Temporary collection delete failed",
      error: error,
    });
  }
};
//Restore collection
export const restoreCollection = async (req: Request, res: Response) => {
  try {
    const updateId = req.params.id;
    if (!updateId) {
      throw new ApiError("No id provided", 400);
    }
    const updateObjectId = new mongoose.Types.ObjectId(updateId);
    const updatedCollection = await Collection.findByIdAndUpdate(
      updateObjectId,
      {
        $set: {
          deleted: false,
        },
      },
      { new: true }
    );

    if (!updatedCollection) {
      throw new ApiError("Failed to restore collection", 400);
    }
    res.status(200).json(updatedCollection);
  } catch (error) {
    res.status(500).json({
      message: "Collection restoration failed",
      error: error,
    });
  }
};
//deleting collection permanently
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
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $pull: { pens: deleteId }, // Remove the pen ID from the pens array
      },
      { new: true }
    );

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
    const collection = await Collection.findById(idObj)
      .populate({
        path: "author",
        model: User,
      })
      .populate({
        path: "pens",
        model: Pen,
      });
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
export const updateCollection = async (req: Request, res: Response) => {
  try {
    const updateId = req.params.id;
    if (!updateId) {
      throw new ApiError("No id provided", 400);
    }
    const updateObjectId = new mongoose.Types.ObjectId(updateId);
    const { title, description } = req.body;

    //empty validation
    if (!title) {
      throw new ApiError("Title is required");
    }
    const updatedCollection = await Collection.findByIdAndUpdate(
      updateObjectId,
      {
        $set: {
          title: title,
          description: description,
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
      message: "Failed to update Collection",
      error: error,
    });
  }
};
