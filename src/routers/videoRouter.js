import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import { protectMiddleware, videoUpload } from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-z]{24})", watch);
videoRouter
  .route("/:id([0-9a-z]{24})/edit")
  .all(protectMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter
  .route("/:id([0-9a-z]{24})/delete")
  .all(protectMiddleware)
  .get(deleteVideo);
videoRouter
  .route("/upload")
  .all(protectMiddleware)
  .get(getUpload)
  .post(videoUpload.single("video"), postUpload);

export default videoRouter;
