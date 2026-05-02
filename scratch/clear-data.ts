import { config } from "dotenv";
config({ path: ".env.local" });

import { ensureDatabase } from "../lib/services/helpers";
import Client from "../models/Client";
import Employee from "../models/Employee";
import Invoice from "../models/Invoice";
import Lead from "../models/Lead";
import Project from "../models/Project";
import Proposal from "../models/Proposal";
import Salary from "../models/Salary";
import Target from "../models/Target";
import mongoose from "mongoose";

async function clearData() {
  console.log("Connecting to database...");
  await ensureDatabase();

  console.log("Clearing dummy data...");
  await Promise.all([
    Client.deleteMany({}),
    Employee.deleteMany({}),
    Invoice.deleteMany({}),
    Lead.deleteMany({}),
    Project.deleteMany({}),
    Proposal.deleteMany({}),
    Salary.deleteMany({}),
    Target.deleteMany({}),
  ]);

  console.log("✅ All dummy data deleted successfully. Only users remain.");
  
  await mongoose.disconnect();
  process.exit(0);
}

clearData().catch((err) => {
  console.error("Error clearing data:", err);
  process.exit(1);
});
