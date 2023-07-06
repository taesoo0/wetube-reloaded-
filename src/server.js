import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import session from "express-session";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));

// 왜 라우터 위에다가 해야하는가 ? 라우터 보다 앞쪽에 있어야 세션값을 확인하고 움질일 수 가 있으니까
// 아래 옵션을 설정해주면 세션 미들웨어가 사이트로 들어오는 모두를 기억하게 된다.
// 세션에 아이디를 넣어주고 , 그 아이디를 바탕으로 해당 브라우저를 기억한다. < 기준이 브라우저이다.>
// 같은 아이피에서 사용해도, 다른 브라우저를 사용하면 다른 세션아이디를 준다. ?(아이피를 차단하는건 api에서 하는일이 아닌가)
app.use(
  session({
    secret: "Hello!",
    resave: true,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  req.sessionStore.all((error, sessions) => {
    console.log(sessions);
    next();
  });
});

app.get("/add-one", (req, res, next) => {
  req.session.potato += 1;
  return res.send(`${req.session.id}\n${req.session.potato}`);
});

app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
