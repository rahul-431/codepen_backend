import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  picture: String,
  password: String,
  googleId: String,
  pens: [
    {
      type: Schema.Types.ObjectId,
      ref: "Pen",
    },
  ],
  collections: [
    {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
  ],
  refreshToken: String,
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followings: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

//predefined middleware
userSchema.pre("save", async function (next) {
  // Skip hashing if the password is not modified
  if (!this.isModified("password")) return next();

  // Check if the password exists (e.g., for Google authentication, it might be undefined)
  if (!this.password) return next();

  try {
    // Hash the password and assign it
    this.password = await bcrypt.hash(this.password as string, 10);
    next();
  } catch (error) {
    console.log("Failed to hash password"); // Pass the error to the next middleware or handler
  }
});

//custom middleware
userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

//generating access token
userSchema.methods.generateAccessToken = async function () {
  if (!process.env.ACCESS_TOKEN_SECRET) return;
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

//generating refresh token
userSchema.methods.generateRefreshToken = async function () {
  if (!process.env.REFRESH_TOKEN_SECRET) return;
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
