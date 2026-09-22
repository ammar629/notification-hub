import {Router, Request, Response} from "express";
import {db} from "@/db";
import {topics, NewTopic} from "@/db/schema";

const router: Router = Router();

// GET /topics - List all topics
router.get("/", async (req: Request, res: Response) => {
    try{
        const allTopics = await db.select().from(topics);
        res.json(allTopics);
    }
    catch(error){
        res.status(500).json({error: "Internal Server Error, Failed to fetch topics."});
    }
});

// POST /topics - Create a new topic
router.post("/", async(req: Request, res: Response) => {
    try{
        const {name} = req.body;
        const newTopic: NewTopic = {name};

        await db.insert(topics).values(newTopic);
        res.status(201).json({message: "Topic Created Successfully"});
    }
    catch(error){
        res.status(400).json({error: "Failed to create topic."});
    }
});


export default router;