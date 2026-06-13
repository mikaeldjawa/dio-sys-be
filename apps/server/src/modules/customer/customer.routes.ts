import { authenticate } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/middlewares/async.middleware";
import { requireAuth } from "@/middlewares/require-auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { Router } from "express";
import * as customerController from "./customer.controller";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.schema";

const router = Router();

router.use(authenticate);
router.use(requireAuth);

router.get("/", asyncHandler(customerController.listCustomers));
router.get(
  "/tenant/:tenantId",
  asyncHandler(customerController.getCustomersByTenant),
);
router.get("/:id", asyncHandler(customerController.getCustomer));
router.post(
  "/",
  validate(createCustomerSchema),
  asyncHandler(customerController.createCustomer),
);
router.patch(
  "/:id",
  validate(updateCustomerSchema),
  asyncHandler(customerController.updateCustomer),
);
router.delete("/:id", asyncHandler(customerController.deleteCustomer));

export default router;
