import mongoose from "mongoose";
let isConnected = false;
export const connectDB = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGO_URI) return console.log("Mongodb url not found");
  if (isConnected) return console.log("Already connected");
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("Connected to mongodb");
  } catch (error) {
    console.log("Failed to connect with db");
    console.log(error);
    process.exit();
  }
};
