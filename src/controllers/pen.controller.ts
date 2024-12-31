import Pen from "@models/pen.model";
import User from "@models/user.model";
import { ApiError } from "@utils/ApiError";
import { ApiResponse } from "@utils/ApiResponse";
import { Request, Response } from "express";
import mongoose from "mongoose";

export const createNewPen = async (req: Request, res: Response) => {
  try {
    //get pen data
    const { title, html, css, js } = req.body;
    const authorId = req.user?._id;
    //empty validation
    if (!title) {
      throw new ApiError("Title is required");
    }
    // create new pen
    const pen = await Pen.create({
      title: title,
      code: {
        html: html,
        css: css,
        js: js,
      },
      author: authorId,
    });

    //check if pen created or not
    const createdPen = await Pen.findById(pen._id);
    if (!createdPen) {
      throw new ApiError("Failed to create new Pen", 500);
    }

    //update the user model
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $push: { pens: createdPen._id },
      },
      { new: true }
    );

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
    const pens = await Pen.find()
      .populate({
        path: "author",
        model: User,
        select: "_id name picture",
      })
      .sort({
        updatedAt: "desc",
      });
    res.status(200).json(pens);
  } catch (error) {
    // Handle other errors
    res.status(500).json({
      message: "An error occurred while retrieving pens",
      error: error,
    });
  }
};
export const getUserPens = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new ApiError("Invalid user id", 404);
    const pens = await Pen.find({ author: userId }).sort({
      updatedAt: "desc",
    });
    res.status(200).json(pens);
  } catch (error) {
    // Handle other errors
    res.status(500).json({
      message: "Something is wrong",
      error: error,
    });
  }
};

//this is for future improvement

// export const getAllPens = async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string, 10) || 1;
//     const search = req.query.search?.toString() || "";
//     const filter = req.query.filter?.toString() || "all";

//     // Calculate the number of posts to skip (pagination)
//     const skipAmount = Math.max(0, (page - 1) * 20);

//     // Filter and search logic
//     let filterQuery = filter !== "all" ? { someField: filter } : {};
//     const searchQuery = search
//       ? {
//           $or: [
//             { title: { $regex: search, $options: "i" } },
//             { description: { $regex: search, $options: "i" } },
//           ],
//         }
//       : {};

//     // Combined query
//     const query = Pen.find({ ...filterQuery, ...searchQuery })
//       .populate({
//         path: "type",
//         match: filterQuery,
//       })
//       .populate({
//         path: "author",
//         model: User,
//         select: "_id name picture",
//       })
//       .populate({
//         path: "likes",
//         model: User,
//       })
//       .populate({
//         path: "comments",
//         populate: {
//           path: "commentBy",
//           model: User,
//         },
//       })
//       .populate({
//         path: "views",
//         model: User,
//       })
//       .sort({
//         updatedAt: "desc",
//       })
//       .skip(skipAmount)
//       .limit(20);

//     // Count total documents matching the query
//     const countPens = await Pen.countDocuments({
//       ...filterQuery,
//       ...searchQuery,
//     });
//     const pens = await query.exec();

//     res.status(200).json({ pens, countPens });
//   } catch (error: any) {
//     console.error("Error fetching pens:", error);
//     res.status(500).json({
//       message: "An error occurred while retrieving pens",
//       error: error?.message || error,
//     });
//   }
// };

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
          code: {
            title: title,
            html: html,
            css: css,
            js: js,
          },
        },
      },
      { new: true }
    );

    if (!updatedPen) {
      throw new ApiError("Failed to update the user", 400);
    }
    res.status(200).json(updatedPen);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update pen",
      error: error,
    });
  }
};
