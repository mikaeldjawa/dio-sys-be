import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { permissions, rolePermissions, roles, tenants, users } from "./schema";

dotenv.config({ path: "../../apps/server/.env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const defaultPermissions = [
  "tenant:list",
  "tenant:create",
  "tenant:update",
  "tenant:delete",
  "tenant:view",
  "tenant:manage",
  "role:list",
  "role:create",
  "role:update",
  "role:delete",
  "role:view",
  "role:manage",
  "permission:list",
  "permission:create",
  "permission:update",
  "permission:delete",
  "permission:view",
  "user:list",
  "user:create",
  "user:update",
  "user:delete",
  "user:view",
  "user:manage",
  "menu:create",
  "menu:read",
  "menu:update",
  "menu:delete",
  "category:create",
  "category:read",
  "category:update",
  "category:delete",
  "order:create",
  "order:read",
  "order:update",
  "order:cancel",
  "table:create",
  "table:read",
  "table:update",
  "table:delete",
  "customer:create",
  "customer:read",
  "customer:update",
  "transaction:create",
  "transaction:read",
];

export const seedPermissions = async () => {
  console.log("Seeding permissions...");

  const existingPermissions = await db.select().from(permissions);
  const existingNames = new Set(existingPermissions.map((p) => p.name));

  const missingPermissions = defaultPermissions.filter(
    (name) => !existingNames.has(name),
  );

  if (missingPermissions.length === 0) {
    console.log(
      `All permissions already seeded (${existingPermissions.length} found). Skipping.`,
    );
    return;
  }

  const permissionRows = missingPermissions.map((name) => ({ name }));

  await db.insert(permissions).values(permissionRows);

  console.log(
    `Seeded ${permissionRows.length} new permissions successfully (${existingPermissions.length} already existed).`,
  );
};

export const seedSuperAdmin = async () => {
  console.log("Seeding super-admin...");

  const existingTenant = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, "system"))
    .limit(1);

  if (existingTenant.length > 0) {
    console.log("Super-admin already exists. Skipping.");
    return;
  }

  const tenant = await db
    .insert(tenants)
    .values({ name: "System", slug: "system" })
    .returning();

  const allPermissions = await db.select().from(permissions);

  const role = await db
    .insert(roles)
    .values({
      tenantId: tenant[0]!.id,
      name: "Super Admin",
      scope: "GLOBAL",
    })
    .returning();

  const rolePermissionRows = allPermissions.map((perm) => ({
    roleId: role[0]!.id,
    permissionId: perm.id,
  }));

  await db.insert(rolePermissions).values(rolePermissionRows);

  const hashedPassword = await bcrypt.hash("Admin@123", 12);

  await db.insert(users).values({
    tenantId: tenant[0]!.id,
    roleId: role[0]!.id,
    name: "Super Admin",
    email: "admin@system.local",
    password: hashedPassword,
  });

  console.log("Super-admin seeded successfully.");
  console.log("Email: admin@system.local");
  console.log("Password: Admin@123");
};

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await seedPermissions();
    await seedSuperAdmin();
  })()
    .then(() => {
      console.log("Seed completed.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}
