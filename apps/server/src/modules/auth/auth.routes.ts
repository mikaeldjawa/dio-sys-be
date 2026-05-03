import { asyncHandler } from "@/middlewares/async.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { Router } from "express";
import * as authController from "./auth.controller";
import { loginSchema, refreshTokenSchema, registerSchema } from "./auth.schema";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(authController.register),
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(authController.login),
);

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  asyncHandler(authController.refresh),
);

export default router;
