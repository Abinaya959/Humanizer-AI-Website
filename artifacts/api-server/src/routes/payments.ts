import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { User } from "../models/User.js";
import { CreateCheckoutSessionBody } from "@workspace/api-zod";

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
    const user = await User.findById(req.userId);
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
              description: plan === "basic" ? "100 humanizations" : "Unlimited humanizations",
            },
            unit_amount: PLAN_PRICES[plan],
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
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
    res.status(400).json({ error: `Webhook Error: ${message}` });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as "basic" | "pro" | undefined;

    if (userId && plan) {
      await User.findByIdAndUpdate(userId, {
        isPremium: true,
        plan,
        stripeCustomerId: session.customer as string,
        stripeSessionId: session.id,
      });
    }
  }

  res.json({ success: true });
});

export default router;
