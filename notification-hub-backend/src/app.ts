import express, { Express, Request, Response } from "express";
import cors from "cors";

// Routes
import authRouter from "@/routes/auth";

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" }); 
});

export default app;