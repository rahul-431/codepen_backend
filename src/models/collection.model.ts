import mongoose, { Schema } from "mongoose";

const collectionSchema = new Schema(
  {
    title: { type: String },
    description: String,
    pens: [
      {
        type: Schema.Types.ObjectId,
        ref: "Pen",
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    stats: {
      likes: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      comments: [
        {
          type: Schema.Types.ObjectId,
          ref: "Comment",
        },
      ],
      views: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
  },
  { timestamps: true }
);
const Collection =
  mongoose.models.Collection || mongoose.model("Collection", collectionSchema);

export default Collection;
