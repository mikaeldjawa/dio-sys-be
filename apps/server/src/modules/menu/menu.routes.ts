import { authenticate } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/middlewares/async.middleware";
import { requireAuth } from "@/middlewares/require-auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { Router } from "express";
import * as menuController from "./menu.controller";
import {
  bulkUpdateAvailabilitySchema,
  createMenuSchema,
  toggleAvailabilitySchema,
  updateMenuSchema,
} from "./menu.schema";

const router = Router();

router.use(authenticate);
router.use(requireAuth);

router.get("/", asyncHandler(menuController.listMenus));
router.get("/tenant/:tenantId", asyncHandler(menuController.getMenusByTenant));
router.get(
  "/category/:categoryId",
  asyncHandler(menuController.getMenusByCategory),
);
router.get("/:id", asyncHandler(menuController.getMenu));
router.post(
  "/",
  validate(createMenuSchema),
  asyncHandler(menuController.createMenu),
);
router.patch(
  "/bulk/availability",
  validate(bulkUpdateAvailabilitySchema),
  asyncHandler(menuController.bulkUpdateAvailability),
);
router.patch(
  "/:id/availability",
  validate(toggleAvailabilitySchema),
  asyncHandler(menuController.toggleAvailability),
);
router.patch(
  "/:id",
  validate(updateMenuSchema),
  asyncHandler(menuController.updateMenu),
);
router.delete("/:id", asyncHandler(menuController.deleteMenu));

export default router;
