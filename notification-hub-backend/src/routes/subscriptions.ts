import {Router, Request, Response} from "express";
import {db} from "@/db";
import {eq} from "drizzle-orm";
import {subscriptions, NewSubscription} from "@/db/schema";

const router: Router = Router();


// POST /subscriptions - Create a new subscription for a user to a specific topic
router.post("/", async(req: Request, res: Response) => {
    try{
        const {userId, topicId} = req.body;

        const newSubscription: NewSubscription = {userId, topicId};

        await db.insert(subscriptions).values(newSubscription);
        res.status(201).json({message: "Subscribed to Topic."})
    }
    catch(error){
        res.status(400).json({error: "Failed To Subscribe."});
    }
});


// GET /subscriptions/:userId - Get all subscriptions for a specific user
router.get("/:userId", async(req: Request, res: Response) => {
    try{
        const userId = req.params.userId as string;

        const userSubscriptions = await db.select()
                                          .from(subscriptions)
                                          .where(eq(subscriptions.userId, parseInt(userId)));

        res.json(userSubscriptions);
    }
    catch(error){
        res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
});


export default router;