import {Router, Request, Response} from "express";
import {db} from "@/db";
import {messages, NewMessage} from "@/db/schema";
import redisClient from "@/lib/redis";


const router: Router = Router();

// POST /publish - Publish message to topic
router.post("/", async(req: Request, res: Response) => {
    try{
        const {topicId, content, createdBy} = req.body;
        const newMessage: NewMessage = {topicId, content, createdBy};

        await db.insert(messages).values(newMessage);

        // Publish to Redis channel
        await redisClient.publish(`topic:${topicId}`, JSON.stringify({
            topicId,
            content,
            createdBy,
            timestamp: new Date(),
        }));

        res.status(201).json({message: "Message Published Successfully."});
    }
    catch(error){
        res.status(400).json({ error: "Failed to Publish Message."});
    }
});


export default router;