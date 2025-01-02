import {
  createNewCollection,
  deleteCollection,
  deleteCollectionTemp,
  getAllCollections,
  getCurrentCollection,
  getTempDeltedCollection,
  getUserCollection,
  makeCollectionPrivate,
  restoreCollection,
  updateCollection,
} from "@controllers/collection.controller";
import { verifyJwt } from "@middlewares/auth.middlware";
import { Router } from "express";

const collectionRouter = Router();

//create new collections
collectionRouter.route("/").post(verifyJwt, createNewCollection);

//update date collection 
collectionRouter.route("/:id").put(verifyJwt,updateCollection)
//get all collections of current user
collectionRouter.route("/get").get(verifyJwt, getUserCollection);
//get all collections
collectionRouter.route("/").get(verifyJwt, getAllCollections);

//delete Collection
collectionRouter.route("/:id").delete(verifyJwt, deleteCollection);


//getCurrentCollection
collectionRouter.route("/current/:id").get(verifyJwt, getCurrentCollection);

//make private
collectionRouter.route("/:id").post(verifyJwt, makeCollectionPrivate);

//delete collection temporarily
collectionRouter.route("/tempDel/:id").post(verifyJwt, deleteCollectionTemp);

//restore collection
collectionRouter.route("/restore/:id").post(verifyJwt, restoreCollection);

//get temporarily deleted collections
collectionRouter.route("/tempDel").get(verifyJwt, getTempDeltedCollection);
export default collectionRouter;
