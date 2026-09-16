import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";
import { generateToken, authenticateToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const existingUser = await db.get("SELECT id FROM users WHERE email = ?", [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      "INSERT INTO users (id, email, password_hash, created_at, last_login_at) VALUES (?, ?, ?, ?, ?)",
      [userId, email.toLowerCase().trim(), passwordHash, now, now]
    );

    const displayName = fullName && fullName.trim().length > 0 
      ? fullName.trim() 
      : email.split("@")[0];

    const profileId = uuidv4();
    await db.run(
      "INSERT INTO profiles (id, user_id, full_name, display_name, updated_at) VALUES (?, ?, ?, ?, ?)",
      [profileId, userId, fullName || "", displayName, now]
    );

    const token = generateToken({ id: userId, email: email.toLowerCase().trim() });

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        displayName
      }
    });
  } catch (error: any) {
    console.error("Error in /register:", error);
    return res.status(500).json({ error: "Internal server error during registration." });
  }
});

// POST /api/auth/login
router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both email and password." });
    }

    const user = await db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const now = new Date().toISOString();
    await db.run("UPDATE users SET last_login_at = ? WHERE id = ?", [now, user.id]);

    const profile = await db.get("SELECT display_name, target_career FROM profiles WHERE user_id = ?", [user.id]);

    const token = generateToken({ id: user.id, email: user.email });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: profile?.display_name || user.email.split("@")[0],
        targetCareer: profile?.target_career || null
      }
    });
  } catch (error: any) {
    console.error("Error in /login:", error);
    return res.status(500).json({ error: "Internal server error during login." });
  }
});

// POST /api/auth/logout
router.post("/logout", authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json({ message: "Successfully logged out." });
});

// GET /api/auth/me
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await db.get("SELECT id, email, created_at, last_login_at FROM users WHERE id = ?", [userId]);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const profile = await db.get("SELECT * FROM profiles WHERE user_id = ?", [userId]);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
        fullName: profile?.full_name || "",
        displayName: profile?.display_name || user.email.split("@")[0],
        education: profile?.education || "",
        degree: profile?.degree || "",
        experienceLevel: profile?.experience_level || "",
        skills: profile?.skills || "",
        interests: profile?.interests || "",
        targetCareer: profile?.target_career || ""
      }
    });
  } catch (error: any) {
    console.error("Error in /me:", error);
    return res.status(500).json({ error: "Internal server error fetching user data." });
  }
});

export default router;
