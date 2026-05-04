import { asyncHandler } from "@/middlewares/async.middleware";
import { authenticate } from "@/middlewares/auth.middleware";
import { requireAuth } from "@/middlewares/require-auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { Router } from "express";
import * as roleController from "./role.controller";
import { createRoleSchema, updateRoleSchema } from "./role.schema";

const router = Router();

router.use(authenticate);
router.use(requireAuth);

router.get("/", asyncHandler(roleController.listRoles));
router.get("/tenant/:tenantId", asyncHandler(roleController.getRolesByTenant));
router.get("/:id", asyncHandler(roleController.getRole));
router.post(
  "/",
  validate(createRoleSchema),
  asyncHandler(roleController.createRole),
);
router.patch(
  "/:id",
  validate(updateRoleSchema),
  asyncHandler(roleController.updateRole),
);
router.delete("/:id", asyncHandler(roleController.deleteRole));

export default router;
