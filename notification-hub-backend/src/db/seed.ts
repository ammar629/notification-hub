import "dotenv/config";
import { db } from "@/db";
import { topics } from "@/db/schema";

async function seed() {
    try {
        const defaultTopics = [
            { name: "general" },
            { name: "announcements" },
            { name: "random" },
            { name: "tech" },
        ];

        for (const topic of defaultTopics) {
            try {
                await db.insert(topics).values(topic);
            } catch (err) {
                // Topic already exists, skip
            }
        }

        console.log("✅ Database seeded with topics");
    } catch (err) {
        console.error("❌ Seed failed:", err);
    }
}

seed();