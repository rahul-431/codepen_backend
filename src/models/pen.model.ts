import mongoose, { Schema } from "mongoose";

const penSchema = new Schema(
  {
    title: String,
    code: {
      html: String,
      css: String,
      js: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deleted: {
      type: Boolean,
      default: false,
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
const Pen = mongoose.models.Pen || mongoose.model("Pen", penSchema);
export default Pen;
