import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

const port = 4000;

const handleListening = () => console.log(`>>Server listening on port ${port}`);

app.listen(port, handleListening);
