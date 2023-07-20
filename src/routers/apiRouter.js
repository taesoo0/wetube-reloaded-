import express from "express";
import { createComment, resgisterView } from "../controllers/videoController";

const apiRouter = express();

apiRouter.post("/videos/:id([0-9a-z]{24})/view", resgisterView);
apiRouter.post("/videos/:id([0-9a-z]{24})/comment", createComment);

export default apiRouter;
