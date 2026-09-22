import {Router, Request, Response} from "express";
import {db} from "@/db";
import {subscriptions} from "@/db/schema";
import {eq} from "drizzle-orm";
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


    try{
        // Get user's subscriptions
        const userSubscriptions = await db.select().from(subscriptions).where(eq(subscriptions.userId, parseInt(userId)));

        // Create a Redis subscriber
        const subscriber = redisClient.duplicate();
        await subscriber.connect();

        // Subscribe to all topics the user is subscribed to
        const topics = userSubscriptions.map((sub)=> `topic:${sub.topicId}`);

        if(topics.length > 0){
            await subscriber.subscribe(...topics);

            subscriber.on("message", (channel: string, message: string) => {
                res.write(`data: ${message}\n\n`);
            });
        }

        // Heartbeat to keep connection alive
        const heartbeat = setInterval(() => {
            res.write(": heartbeat\n\n");
        }, 30000);

        // Cleanup on disconnect
        req.on("close", async () => {
            clearInterval(heartbeat);
            await subscriber.unsubscribe();
            await subscriber.disconnect();
            res.end();
        });
}
catch(error){
    res.status(500).json({ error: "Failed to connect" });
}
});


export default router;