import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { CreateCheckoutSessionBody } from "@workspace/api-zod";
import { logger } from "../lib/logger.js";

const router = Router();

const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"] || "", {
  apiVersion: "2025-02-24.acacia",
});

const PLAN_PRICES: Record<string, number> = {
  basic: 4900,
  pro: 9900,
};

const PLAN_NAMES: Record<string, string> = {
  basic: "Humanizer AI Basic",
  pro: "Humanizer AI Pro",
};

const PLAN_DESC: Record<string, string> = {
  basic: "100 humanizations per month",
  pro: "Unlimited humanizations + priority processing",
};

router.post(
  "/create-checkout-session",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const parsed = CreateCheckoutSessionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", message: parsed.error.message });
      return;
    }

    const { plan } = parsed.data;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const domains = process.env["REPLIT_DOMAINS"]?.split(",")[0] || "localhost:80";
    const baseUrl = `https://${domains}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: PLAN_NAMES[plan],
              description: PLAN_DESC[plan],
            },
            unit_amount: PLAN_PRICES[plan],
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        userId: String(user.id),
        plan,
      },
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment-cancel`,
    });

    res.json({ url: session.url });
  }
);

router.post("/webhook", async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"] || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error({ err }, "Stripe webhook verification failed");
    res.status(400).json({ error: `Webhook Error: ${message}` });
    return;
  }

  logger.info({ type: event.type }, "Stripe webhook received");

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as "basic" | "pro" | undefined;

    if (userId && plan) {
      await db
        .update(usersTable)
        .set({
          isPremium: true,
          plan,
          stripeCustomerId: session.customer as string | null,
          stripeSessionId: session.id,
        })
        .where(eq(usersTable.id, Number(userId)));

      logger.info({ userId, plan }, "User upgraded to premium");
    }
  }

  res.json({ success: true });
});

export default router;
