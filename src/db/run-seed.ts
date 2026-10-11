import { seedDatabase } from "./seed";

seedDatabase()
  .then((r) => {
    console.log("✅ Seed result:", r);
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
