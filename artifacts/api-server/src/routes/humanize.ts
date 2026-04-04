import { Router, type Response } from "express";
import OpenAI from "openai";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authMiddleware, requirePremiumOrLimit, type AuthRequest } from "../middlewares/auth.js";
import { HumanizeTextBody } from "@workspace/api-zod";
import { fallbackHumanize } from "../lib/fallbackHumanize.js";
import { logger } from "../lib/logger.js";

const router = Router();

const openai = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });

router.post(
  "/",
  authMiddleware,
  requirePremiumOrLimit,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const parsed = HumanizeTextBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", message: parsed.error.message });
      return;
    }

    const { text } = parsed.data;

    let humanizedText = "";
    let usedFallback = false;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert writer who transforms AI-generated text into natural, human-like writing. " +
              "Rewrite the provided text to sound authentic, conversational, and engaging — like it was written by a thoughtful human. " +
              "Vary sentence lengths, use natural transitions, avoid robotic phrasing and repetition. " +
              "Preserve the original meaning and key points. Return only the rewritten text with no commentary.",
          },
          { role: "user", content: text },
        ],
        temperature: 0.85,
        max_tokens: 2000,
      });

      humanizedText = completion.choices[0]?.message?.content?.trim() ?? "";

      if (!humanizedText) {
        throw new Error("Empty response from OpenAI");
      }
    } catch (err) {
      logger.warn({ err }, "OpenAI humanization failed — using fallback humanizer");
      humanizedText = fallbackHumanize(text);
      usedFallback = true;
    }

    const [user] = await db
      .update(usersTable)
      .set({ usageCount: sql`${usersTable.usageCount} + 1` })
      .where(eq(usersTable.id, req.userId!))
      .returning();

    res.json({
      humanizedText,
      usageCount: user.usageCount,
      freeLimit: user.freeLimit,
      isPremium: user.isPremium,
      usedFallback,
    });
  }
);

export default router;
