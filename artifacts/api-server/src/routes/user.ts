import { Router, type Response } from "express";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { User } from "../models/User.js";

const router = Router();

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "User not found" });
    return;
  }

  res.json({
    id: user._id,
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
