import { config } from "dotenv";
config({ path: ".env.local" });
import { seededCredentials } from "../lib/data/seed-credentials";
import { seedAllData } from "../lib/services/seed";

async function main() {
  const result = await seedAllData();
  console.log("Seed completed:", result);
  console.log("Seeded credentials:");

  for (const credential of seededCredentials) {
    console.log(`- ${credential.label}: ${credential.email} / ${credential.password}`);
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
