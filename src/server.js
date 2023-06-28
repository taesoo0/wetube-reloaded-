import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const port = 4000;

const app = express();
const logger = morgan("dev");
app.use(logger);

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

const home = (req, res) => {
  console.log("I will response");
  return res.send("hello");
};

const login = (req, res) => {
  return res.send("login");
};

const handleListening = () => console.log(`Server listening on port ${port}`);

app.listen(port, handleListening);
