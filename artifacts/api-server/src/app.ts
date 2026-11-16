
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", router);

// Frontend production build
const frontendDist = path.resolve(
  process.cwd(),
  "../hand-cricket-arena/dist/public",
);

app.use(express.static(frontendDist));

// Support React frontend routes
app.use((req, res, next) => {
  if (
    req.method !== "GET" ||
    req.path.startsWith("/api") ||
    req.path.startsWith("/socket.io")
  ) {
    return next();
  }

  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) next(err);
  });
});

export default app;
