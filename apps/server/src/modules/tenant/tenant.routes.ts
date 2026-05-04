import { asyncHandler } from "@/middlewares/async.middleware";
import { authenticate } from "@/middlewares/auth.middleware";
import { requireAuth } from "@/middlewares/require-auth.middleware";
import { requireGlobal } from "@/middlewares/require-global.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { Router } from "express";
import * as tenantController from "./tenant.controller";
import { createTenantSchema, updateTenantSchema } from "./tenant.schema";

const router = Router();

router.use(authenticate);

router.get("/", requireGlobal, asyncHandler(tenantController.listTenants));

router.get("/me", requireAuth, asyncHandler(tenantController.getMyTenant));

router.get("/:id", requireGlobal, asyncHandler(tenantController.getTenant));

router.post(
  "/",
  requireGlobal,
  validate(createTenantSchema),
  asyncHandler(tenantController.createTenant),
);

router.patch(
  "/me",
  requireAuth,
  validate(updateTenantSchema),
  asyncHandler(tenantController.updateMyTenant),
);

router.patch(
  "/:id",
  requireGlobal,
  validate(updateTenantSchema),
  asyncHandler(tenantController.updateTenant),
);

router.delete(
  "/me",
  requireAuth,
  asyncHandler(tenantController.deleteMyTenant),
);

router.delete(
  "/:id",
  requireGlobal,
  asyncHandler(tenantController.deleteTenant),
);

export default router;
