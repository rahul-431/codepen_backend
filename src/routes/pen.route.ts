import {
  createNewPen,
  deletePen,
  getAllPens,
  getCurrentPen,
  getUserPens,
  makePenPrivate,
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

//delete pen
penRouter.route("/:id").delete(verifyJwt, deletePen);

//getCurrentPen
penRouter.route("/:id").get(verifyJwt, getCurrentPen);

//update type
penRouter.route("/:id").post(verifyJwt, makePenPrivate);

export default penRouter;
