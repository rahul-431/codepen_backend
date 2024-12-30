import {
  createNewPen,
  deletePen,
  getAllPens,
  getCurrentPen,
  updatePen,
} from "@controllers/pen.controller";
import { Router } from "express";

const penRouter = Router();

//create new pen
penRouter.route("/").post(createNewPen);

//get all pens
penRouter.route("/").get(getAllPens);

//update pens
penRouter.route("/:id").put(updatePen);

//delete pen
penRouter.route("/:id").delete(deletePen);

//getCurrentPen
penRouter.route("/:id").get(getCurrentPen);

export default penRouter;
