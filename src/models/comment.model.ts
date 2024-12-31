import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
  message: String,
  commentBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);
export default Comment;
