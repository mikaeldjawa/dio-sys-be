import { authenticate } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/middlewares/async.middleware";
import { requireAuth } from "@/middlewares/require-auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { Router } from "express";
import * as categoryController from "./category.controller";
import { createCategorySchema, updateCategorySchema } from "./category.schema";

const router = Router();

router.use(authenticate);
router.use(requireAuth);

router.get("/", asyncHandler(categoryController.listCategories));
router.get(
  "/tenant/:tenantId",
  asyncHandler(categoryController.getCategoriesByTenant),
);
router.get("/:id", asyncHandler(categoryController.getCategory));
router.post(
  "/", 
  validate(createCategorySchema),
  asyncHandler(categoryController.createCategory),
);
router.patch(
  "/:id",
  validate(updateCategorySchema),
  asyncHandler(categoryController.updateCategory),
);
router.delete("/:id", asyncHandler(categoryController.deleteCategory));

export default router;
