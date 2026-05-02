import { asyncHandler } from "@/middlewares/async.middleware";
import { Router } from "express";
import * as userController from "./user.controller";

const router = Router();

router.get("/", asyncHandler(userController.getUsers));
router.get<{ id: string }>("/:id", asyncHandler(userController.getUserById));

export default router;
