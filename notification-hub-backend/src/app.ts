import express, { Express, Request, Response } from "express";
import cors from "cors";

// Routes
import authRouter from "@/routes/auth";
import topicRouter from "@/routes/topics";
import subscriptionRouter from "@/routes/subscriptions";
import publishRouter from "@/routes/publish";

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/topics", topicRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/publish", publishRouter);

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" }); 
});

export default app;