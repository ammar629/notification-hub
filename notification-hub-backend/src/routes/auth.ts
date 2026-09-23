import { Router, Request, Response } from "express";
import { db } from "@/db";
import { users, NewUser } from "@/db/schema";
import { eq } from "drizzle-orm";

const router: Router = Router();

// POST /auth/signup
router.post("/signup", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate fields
        if (!email || !email.trim()) {
            return res.status(400).json({ error: "Email is required" });
        }
        if (!password || !password.trim()) {
            return res.status(400).json({ error: "Password is required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const newUser: NewUser = {
            email: email.trim(),
            password, // TODO: Hash password with bcrypt later
            isAdmin: false,
        };

        const result = await db.insert(users).values(newUser).returning();

        res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        console.error("Signup error:", error); // Log the actual error
        res.status(400).json({ error: "Signup Failed" });
    }
});


export default router;