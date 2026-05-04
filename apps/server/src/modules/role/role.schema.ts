import { z } from "zod";

export const createRoleSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(100).trim(),
  scope: z.enum(["GLOBAL", "TENANT"]).default("TENANT"),
  permissionIds: z.array(z.string().uuid()).optional().default([]),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  scope: z.enum(["GLOBAL", "TENANT"]).optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
