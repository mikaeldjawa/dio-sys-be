import * as userRepo from "./user.repository";

export const getAllUsers = async () => {
  return await userRepo.findAllUsers();
};

export const getUserById = async (id: string) => {
  return await userRepo.findUserById(id);
};

