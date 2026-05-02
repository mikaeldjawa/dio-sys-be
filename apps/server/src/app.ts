import { env } from "@dio-sys-be/env/server";
import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/error.middleware";
import userRoute from "./modules/user/user.route";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.use(express.json());

app.use("/users", userRoute);

app.use(errorHandler);

export default app;
