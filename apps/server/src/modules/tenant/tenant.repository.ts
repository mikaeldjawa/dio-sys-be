import { db } from "@dio-sys-be/db";

export const findAllTenants = async () => {
  return db.query.tenants.findMany();
};

export const findTenantById = async (id: string) => {
  return db.query.tenants.findFirst({
    where: (tenant, { eq }) => eq(tenant.id, id),
  });
};
