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

        res.status(201).json({
            message: "User created successfully", user: {
                id: result[0].id,
                email: result[0].email,
            }
        });
    }
    catch (error) {
        console.error("Signup error:", error); // Log the actual error
        res.status(400).json({ error: "Signup Failed" });
    }
});


// POST - /auth/login
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ error: "Email is Required" });
        }

        if (!password || !password.trim()) {
            return res.status(400).json({ error: "Password is Required" });
        }

        // Find User by Email
        const user = await db.select().from(users).where(eq(users.email, email.trim()));

        if (user.length === 0) {
            return res.status(401).json({ error: "User Not Found" });
        }

        // Check Password (TODO: use bcrypt hashing)
        if (user[0].password !== password) {
            return res.status(401).json({ error: "Invalid Password" });
        }

        res.status(200).json({ message: "Login Successful", userId: user[0].id, email: user[0].email });
    } catch (error) {
        console.error(`An Error Occurred While Trying To Login: ${error}`);
        res.status(400).json({ error: "Login Failed" });
    }
})


export default router;