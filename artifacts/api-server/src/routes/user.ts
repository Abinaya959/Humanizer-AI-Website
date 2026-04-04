import { Router, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    isPremium: user.isPremium,
    plan: user.plan,
    usageCount: user.usageCount,
    freeLimit: user.freeLimit,
    createdAt: user.createdAt,
  });
});

export default router;
