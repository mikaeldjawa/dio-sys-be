import { env } from "@dio-sys-be/env/server";
import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/error.middleware";
import authRoute from "./modules/auth/auth.routes";
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

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/tenants", tenantRoute);

app.use(errorHandler);

export default app;
