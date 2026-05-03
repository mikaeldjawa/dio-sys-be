import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless";
import { permissions } from "./schema";

dotenv.config({ path: "../../apps/server/.env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const defaultPermissions = [
  "tenant:read",
  "tenant:update",
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
  "user:create",
  "user:read",
  "user:update",
  "user:delete",
  "role:create",
  "role:read",
  "role:update",
  "role:delete",
];

export const seedPermissions = async () => {
  console.log("Seeding permissions...");

  const existingPermissions = await db.select().from(permissions);

  if (existingPermissions.length > 0) {
    console.log(
      `Permissions already seeded (${existingPermissions.length} found). Skipping.`,
    );
    return;
  }

  const permissionRows = defaultPermissions.map((name) => ({ name }));

  await db.insert(permissions).values(permissionRows);

  console.log(`Seeded ${permissionRows.length} permissions successfully.`);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seedPermissions()
    .then(() => {
      console.log("Seed completed.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}
