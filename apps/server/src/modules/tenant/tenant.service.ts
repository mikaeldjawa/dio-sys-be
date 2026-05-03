import * as tenantRepo from "./tenant.repository";

export const getAllTenants = async () => {
  return await tenantRepo.findAllTenants();
};

export const getTenantById = async (id: string) => {
  return await tenantRepo.findTenantById(id);
};
