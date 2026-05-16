import { authenticate } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/middlewares/async.middleware";
import { requireAuth } from "@/middlewares/require-auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { Router } from "express";
import * as tableController from "./table.controller";
import {
  createTableSchema,
  updateTableSchema,
  updateTableStatusSchema,
} from "./table.schema";

const router = Router();

router.use(authenticate);
router.use(requireAuth);

router.get("/", asyncHandler(tableController.listTables));
router.get("/tenant/:tenantId", asyncHandler(tableController.getTablesByTenant));
router.get("/:id", asyncHandler(tableController.getTable));
router.post(
  "/",
  validate(createTableSchema),
  asyncHandler(tableController.createTable),
);
router.patch(
  "/:id/status",
  validate(updateTableStatusSchema),
  asyncHandler(tableController.updateTableStatus),
);
router.patch(
  "/:id",
  validate(updateTableSchema),
  asyncHandler(tableController.updateTable),
);
router.delete("/:id", asyncHandler(tableController.deleteTable));

export default router;
