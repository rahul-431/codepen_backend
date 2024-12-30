import mongoose, { Schema } from "mongoose";

const penSchema = new Schema(
  {
    title: String,
    html: String,
    css: String,
    js: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
const Pen = mongoose.models.Pen || mongoose.model("Pen", penSchema);
export default Pen;
