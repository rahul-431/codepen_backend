import { connectDB } from "@db/connection";
import dotenv from "dotenv";
import app from "../app";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (e) => {
      console.log("error", e);
      throw e;
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server is runnning at ", process.env.PORT || 3000);
    });
  })
  .catch((error) => {
    console.log("Mongo db connection failed", error);
  });
