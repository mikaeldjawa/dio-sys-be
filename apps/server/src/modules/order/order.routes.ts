import { authenticate } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/middlewares/async.middleware";
import { requireAuth } from "@/middlewares/require-auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { Router } from "express";
import * as orderController from "./order.controller";
import {
  createOrderSchema,
  publicCreateOrderSchema,
  updateOrderStatusSchema,
} from "./order.schema";

const router = Router();

router.get(
  "/public/menu",
  asyncHandler(orderController.getPublicMenu),
);
router.post(
  "/public",
  validate(publicCreateOrderSchema),
  asyncHandler(orderController.createPublicOrder),
);

router.use(authenticate);
router.use(requireAuth);

router.get("/", asyncHandler(orderController.listOrders));
router.get("/:id", asyncHandler(orderController.getOrder));
router.post(
  "/",
  validate(createOrderSchema),
  asyncHandler(orderController.createOrder),
);
router.patch(
  "/:id/status",
  validate(updateOrderStatusSchema),
  asyncHandler(orderController.updateOrderStatus),
);
router.delete("/:id", asyncHandler(orderController.deleteOrder));

export default router;
