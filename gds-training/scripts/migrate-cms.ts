import { migrateLegacyToCms } from "../lib/cms/migrate";
import path from "path";

async function runMigration() {
    console.log("Starting CMS Migration...");
    const result = await migrateLegacyToCms();
    if (result.success) {
        console.log("Migration successful!");
        console.log(JSON.stringify(result.results, null, 2));
        process.exit(0);
    } else {
        console.error("Migration failed:", result.error);
        process.exit(1);
    }
}

runMigration().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
