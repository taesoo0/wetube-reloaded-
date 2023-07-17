import express from "express";
import { resgisterView } from "../controllers/videoController";

export const apiRouter = express();

apiRouter.post("/videos/:id([0-9a-z]{24})/view", resgisterView);
