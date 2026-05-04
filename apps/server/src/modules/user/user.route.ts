import { asyncHandler } from "@/middlewares/async.middleware";
import { authenticate } from "@/middlewares/auth.middleware";
import { requireAuth } from "@/middlewares/require-auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { Router } from "express";
import * as userController from "./user.controller";
import { createUserSchema, updateUserSchema } from "./user.schema";

const router = Router();

router.use(authenticate);
router.use(requireAuth);

router.get("/", asyncHandler(userController.listUsers));
router.get("/tenant/:tenantId", asyncHandler(userController.getUsersByTenant));
router.get("/:id", asyncHandler(userController.getUser));
router.post(
  "/",
  validate(createUserSchema),
  asyncHandler(userController.createUser),
);
router.patch(
  "/:id",
  validate(updateUserSchema),
  asyncHandler(userController.updateUser),
);
router.delete("/:id", asyncHandler(userController.deleteUser));

export default router;
