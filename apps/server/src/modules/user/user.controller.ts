import { type RequestHandler } from "express";
import * as userService from "./user.service";

export const getUsers: RequestHandler = async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
};

export const getUserById: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  res.json(user);
};
