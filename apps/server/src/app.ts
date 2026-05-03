import { env } from "@dio-sys-be/env/server";
import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/error.middleware";
import tenantRoute from "./modules/tenant/tenant.routes";
import userRoute from "./modules/user/user.route";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.use(express.json());

app.use("/api/users", userRoute);
app.use("/tenants", tenantRoute);

app.use(errorHandler);

export default app;
