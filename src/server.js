import express from "express";

const port = 4000;

const app = express();

const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

const controller = (req, res) => {
  return res.send("I love middleware");
};

app.use(logger);

app.get("/", controller);

const handleListening = () => console.log(`Server listening on port ${port}`);

app.listen(port, handleListening);
