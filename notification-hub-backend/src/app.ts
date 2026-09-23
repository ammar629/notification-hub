import "dotenv/config";
import express, { Express, Request, Response } from "express";
import cors from "cors";

// Routes
import authRouter from "@/routes/auth";
import topicRouter from "@/routes/topics";
import subscriptionRouter from "@/routes/subscriptions";
import publishRouter from "@/routes/publish";
import sseRouter from "@/routes/sse";

const app: Express = express();

// TODO: Configure CORS to allow only specific origins in production
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/topics", topicRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/publish", publishRouter);
app.use("/api/events", sseRouter);

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default app;