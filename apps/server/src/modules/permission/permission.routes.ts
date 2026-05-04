import { asyncHandler } from "@/middlewares/async.middleware";
import { authenticate } from "@/middlewares/auth.middleware";
import { requireAuth } from "@/middlewares/require-auth.middleware";
import { requireGlobal } from "@/middlewares/require-global.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { Router } from "express";
import * as permissionController from "./permission.controller";
import {
  createPermissionSchema,
  updatePermissionSchema,
} from "./permission.schema";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  requireAuth,
  asyncHandler(permissionController.listPermissions),
);
router.get(
  "/:id",
  requireAuth,
  asyncHandler(permissionController.getPermission),
);
router.post(
  "/",
  requireGlobal,
  validate(createPermissionSchema),
  asyncHandler(permissionController.createPermission),
);
router.patch(
  "/:id",
  requireGlobal,
  validate(updatePermissionSchema),
  asyncHandler(permissionController.updatePermission),
);
router.delete(
  "/:id",
  requireGlobal,
  asyncHandler(permissionController.deletePermission),
);

export default router;
