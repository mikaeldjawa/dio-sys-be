import { db } from "@dio-sys-be/db";

export const findAllUsers = async () => {
  return db.query.users.findMany();
};

export const findUserById = async (id: string) => {
  return db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, id),
  });
};
