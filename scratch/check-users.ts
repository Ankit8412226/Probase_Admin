import { config } from "dotenv";
config({ path: ".env.local" });
import { findUserByEmail } from "../lib/services/users";
import { hasMongoConnection } from "../lib/db";

async function check() {
  console.log("Memory Store Active:", !hasMongoConnection());
  
  const emails = ["admin@probase.io", "manager@probase.io", "business@probase.io"];
  
  for (const email of emails) {
    const user = await findUserByEmail(email);
    if (user) {
      console.log(`✅ Found user: ${email} (Role: ${user.role})`);
      console.log(`   Password in DB starts with $2: ${user.password.startsWith("$2")}`);
    } else {
      console.log(`❌ User NOT found: ${email}`);
    }
  }
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
