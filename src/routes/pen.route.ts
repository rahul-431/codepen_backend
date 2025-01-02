import {
  createNewPen,
  deletePen,
  deletePenTemp,
  getAllPens,
  getCurrentPen,
  getTempDeletedPens,
  getUserPens,
  makePenPrivate,
  restorePen,
  updatePen,
} from "@controllers/pen.controller";
import { verifyJwt } from "@middlewares/auth.middlware";
import { Router } from "express";

const penRouter = Router();

//create new pen
penRouter.route("/").post(verifyJwt, createNewPen);

//get all pens of current user
penRouter.route("/get").get(verifyJwt, getUserPens);

//get all pens
penRouter.route("/").get(verifyJwt, getAllPens);

//update pens
penRouter.route("/:id").put(verifyJwt, updatePen);

//delete pen permanently
penRouter.route("/:id").delete(verifyJwt, deletePen);

//getCurrentPen
penRouter.route("/current/:id").get(verifyJwt, getCurrentPen);

//update type
penRouter.route("/:id").post(verifyJwt, makePenPrivate);

//delete pen temporarily
penRouter.route("/tempDel/:id").post(verifyJwt, deletePenTemp);

//restore pen
penRouter.route("/restore/:id").post(verifyJwt, restorePen);

//get temporary deleted pens
penRouter.route("/tempDel").get(verifyJwt, getTempDeletedPens);

export default penRouter;
