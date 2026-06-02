import { authenticate } from "@/middlewares/auth.middleware";
import { asyncHandler } from "@/middlewares/async.middleware";
import { requireAuth } from "@/middlewares/require-auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { Router } from "express";
import * as transactionController from "./transaction.controller";
import { createTransactionSchema } from "./transaction.schema";

const router = Router();

router.use(authenticate);
router.use(requireAuth);

router.get("/", asyncHandler(transactionController.listTransactions));
router.get(
  "/order/:orderId",
  asyncHandler(transactionController.getTransactionByOrder),
);
router.get("/:id", asyncHandler(transactionController.getTransaction));
router.post(
  "/",
  validate(createTransactionSchema),
  asyncHandler(transactionController.createTransaction),
);
router.delete("/:id", asyncHandler(transactionController.deleteTransaction));

export default router;
