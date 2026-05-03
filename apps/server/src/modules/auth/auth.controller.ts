import type { RequestHandler } from "express";
import type {
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
} from "./auth.schema";
import * as authService from "./auth.service";

export const register: RequestHandler<object, object, RegisterInput> = async (
  req,
  res,
) => {
  const result = await authService.register(req.body);
  res.status(201).json({
    success: true,
    data: result,
    message: "Registration successful",
  });
};

export const login: RequestHandler<object, object, LoginInput> = async (
  req,
  res,
) => {
  const result = await authService.login(req.body);
  res.json({
    success: true,
    data: result,
  });
};

export const refresh: RequestHandler<
  object,
  object,
  RefreshTokenInput
> = async (req, res) => {
  const result = await authService.refreshAccessToken(req.body);
  res.json({
    success: true,
    data: result,
  });
};
