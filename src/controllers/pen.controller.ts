import Pen from "@models/pen.model";
import { ApiError } from "@utils/ApiError";
import { ApiResponse } from "@utils/ApiResponse";
import { Request, Response } from "express";
import mongoose from "mongoose";

export const createNewPen = async (req: Request, res: Response) => {
  try {
    //get pen data
    const { title, html, css, js } = req.body;

    //empty validation
    if (!title) {
      throw new ApiError("Title is required");
    }
    // create new pen
    const pen = await Pen.create({
      title,
      html,
      css,
      js,
    });

    //check if pen created or not
    const createdPen = await Pen.findById(pen._id);
    if (!createdPen) {
      throw new ApiError("Failed to create new Pen", 500);
    }

    //sending response
    res.status(201).json(createdPen);
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
export const getAllPens = async (req: Request, res: Response) => {
  try {
    const pens = await Pen.find();
    res
      .status(200)
      .json(new ApiResponse(pens, "All pens retrieved successfully"));
  } catch (error) {
    // Handle other errors
    res.status(500).json({
      message: "An error occurred while retrieving pens",
      error: error,
    });
  }
};
export const deletePen = async (req: Request, res: Response) => {
  try {
    const deleteId = req.params.id;
    if (!deleteId) {
      throw new ApiError("No id provided", 400);
    }
    const deleteObjectId = new mongoose.Types.ObjectId(deleteId);
    const deletedPen = await Pen.findByIdAndDelete(deleteObjectId);
    if (!deletedPen) {
      throw new ApiError("Pen not found", 400);
    }
    res.status(204).json({ message: "Pen deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete pen",
      error: error,
    });
  }
};
export const getCurrentPen = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new ApiError("No id provided", 400);
    }
    const idObj = new mongoose.Types.ObjectId(id);
    const pen = await Pen.findById(idObj);
    if (!pen) {
      throw new ApiError("Pen not found", 400);
    }
    res.status(200).json(pen);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get pen",
      error: error,
    });
  }
};
export const updatePen = async (req: Request, res: Response) => {
  try {
    const updateId = req.params.id;
    if (!updateId) {
      throw new ApiError("No id provided", 400);
    }
    const updateObjectId = new mongoose.Types.ObjectId(updateId);
    const { title, html, css, js } = req.body;

    //empty validation
    if (!title) {
      throw new ApiError("Title is required");
    }
    const updatedPen = await Pen.findByIdAndUpdate(
      updateObjectId,
      {
        $set: {
          title: title,
          html: html,
          css: css,
          js: js,
        },
      },
      { new: true }
    );

    if (!updatedPen) {
      throw new ApiError("Failed to update the user", 400);
    }
    res.status(200).json(new ApiResponse(updatedPen, "Updated successfully"));
  } catch (error) {
    res.status(500).json({
      message: "Failed to update pen",
      error: error,
    });
  }
};
