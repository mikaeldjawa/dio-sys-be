import { env } from "@dio-sys-be/env/server";
import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/error.middleware";
import authRoute from "./modules/auth/auth.routes";
import categoryRoute from "./modules/category/category.routes";
import menuRoute from "./modules/menu/menu.routes";
import permissionRoute from "./modules/permission/permission.routes";
import roleRoute from "./modules/role/role.routes";
import tableRoute from "./modules/table/table.routes";
import tenantRoute from "./modules/tenant/tenant.routes";
import userRoute from "./modules/user/user.route";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/tenants", tenantRoute);
app.use("/api/v1/roles", roleRoute);
app.use("/api/v1/permissions", permissionRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/menus", menuRoute);
app.use("/api/v1/tables", tableRoute);

app.use(errorHandler);

export default app;
