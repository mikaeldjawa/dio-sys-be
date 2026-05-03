import type { RequestHandler } from "express";
import * as tenantService from "./tenant.service";

export const getTenants: RequestHandler = async (req, res) => {
  const tenants = await tenantService.getAllTenants();
  return tenants;
};

export const getTenantById: RequestHandler<{ id: string }> = async (
  req,
  res,
) => {
  const { id } = req.params;
  const tenant = await tenantService.getTenantById(id);
  return tenant;
};
