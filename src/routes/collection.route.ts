import {
  createNewCollection,
  deleteCollection,
  getAllCollections,
  getCurrentCollection,
  getUserCollection,
  makeCollectionPrivate,
} from "@controllers/collection.controller";
import { verifyJwt } from "@middlewares/auth.middlware";
import { Router } from "express";

const collectionRouter = Router();

//create new pen
collectionRouter.route("/").post(verifyJwt, createNewCollection);

//get all pens of current user
collectionRouter.route("/get").get(verifyJwt, getUserCollection);
//get all pens
collectionRouter.route("/").get(verifyJwt, getAllCollections);

//delete pen
collectionRouter.route("/:id").delete(verifyJwt, deleteCollection);

//getCurrentPen
collectionRouter.route("/:id").get(verifyJwt, getCurrentCollection);

//make private
collectionRouter.route("/:id").post(verifyJwt, makeCollectionPrivate);

export default collectionRouter;
