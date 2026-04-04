import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import mongoose from "mongoose";
import { logger } from "./lib/logger.js";
import mainRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import humanizeRouter from "./routes/humanize.js";
import paymentsRouter from "./routes/payments.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoUri = process.env["MONGO_URI"];
if (!mongoUri) {
  logger.error("MONGO_URI is not set");
  process.exit(1);
}

const mongoOptions: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 15000,
};

mongoose
  .connect(mongoUri, mongoOptions)
  .then(() => logger.info("MongoDB connected"))
  .catch((err) => {
    logger.error({ err }, "MongoDB connection failed");
    process.exit(1);
  });

app.use("/api", mainRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/humanize", humanizeRouter);
app.use("/api/payments", paymentsRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error", message: err.message });
});

export default app;
