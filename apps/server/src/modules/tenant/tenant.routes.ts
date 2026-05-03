import { asyncHandler } from "@/middlewares/async.middleware";
import { Router } from "express";
import * as tenantController from "./tenant.controller";

const router = Router();

router.get("/", asyncHandler(tenantController.getTenants));
router.get<{ id: string }>(
  "/:id",
  asyncHandler(tenantController.getTenantById),
);

export default router;
