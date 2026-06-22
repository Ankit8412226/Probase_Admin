import { config } from "dotenv";
config({ path: ".env.local" });
import { generateWithGemini } from "../lib/gemini";

async function main() {
  console.log("Testing Gemini API connection using key in .env.local...");
  const reply = await generateWithGemini("Say hello and confirm you are up and running as our Sales strategist!");
  console.log("\n--- GEMINI RESPONSE ---");
  console.log(reply);
  console.log("------------------------");
  console.log("\nSuccess! The Gemini API integration is working correctly.");
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
