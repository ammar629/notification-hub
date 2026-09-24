import { Router, Request, Response } from "express";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import redisClient from "@/lib/redis";

const router: Router = Router();

// GET /events/:userId - SSE endpoint for real-time notification events
router.get("/:userId", async (req: Request, res: Response) => {
    const userId = req.params.userId as string;

    // Set Headers for SSE (Reference: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // No need for CORS headers as it is handled by cors middleware in app.ts

    try {
        const userSubscriptions = await db.select().from(subscriptions).where(eq(subscriptions.userId, parseInt(userId)));
        console.log("User subscriptions:", userSubscriptions);

        const subscriber = redisClient.duplicate();

        // Wait for subscriber to be ready
        subscriber.on("ready", async () => {
            console.log("Subscriber ready");

            const topics = userSubscriptions.map((sub) => `topic:${sub.topicId}`);
            console.log("Topics to subscribe:", topics);

            if (topics.length > 0) {
                await subscriber.subscribe(...topics);
                console.log("Subscribed to topics");

                subscriber.on("message", (channel: string, message: string) => {
                    console.log("Message on", channel, ":", message);

                    try {
                        // Extract topicId from channel name (e.g., "topic:1" → 1)
                        const topicId = channel.split(":")[1];

                        // Add channel info to message
                        const enrichedMessage = {
                            ...JSON.parse(message),
                            topicId: parseInt(topicId),
                            channel: channel
                        };

                        res.write(`data: ${JSON.stringify(enrichedMessage)}\n\n`);
                    } catch (err: unknown) {
                        if (err instanceof Error) {
                            console.error("Failed to parse message:", err.message);
                        }
                    }
                });
            } else {
                console.log("data: No subscriptions found\n\n");
            }
        });

        subscriber.on("error", (err) => {
            console.error("Subscriber error:", err);
            res.write(`data: Error - ${err.message}\n\n`);
        });

        // Heartbeat
        const heartbeat = setInterval(() => {
            res.write(": heartbeat\n\n");
        }, 30000);

        req.on("close", async () => {
            clearInterval(heartbeat);
            await subscriber.disconnect();
            res.end();
        });
    }
    catch (error) {
        console.error("SSE error:", error);
        res.status(500).json({ error: "Failed to connect" });
    }
});


export default router;