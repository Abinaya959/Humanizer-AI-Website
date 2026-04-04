import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useCreateCheckoutSession } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { CheckCircle2, Loader2, Zap } from "lucide-react";

export default function Pricing() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const checkout = useCreateCheckoutSession();

  const handleSubscribe = (plan: "basic" | "pro") => {
    if (!token) {
      setLocation("/login");
      return;
    }

    checkout.mutate(
      { data: { plan } },
      {
        onSuccess: (res) => {
          window.location.href = res.url;
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Could not initiate checkout";
          toast({
            title: "Checkout failed",
            description: msg,
            variant: "destructive"
          });
        }
      }
    );
  };

  const isBasic = user?.plan === "basic";
  const isPro = user?.plan === "pro";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your writing needs. Upgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <Card className="relative flex flex-col border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Basic</CardTitle>
              <CardDescription className="text-base">For occasional writers</CardDescription>
              <div className="mt-4 font-black text-4xl">
                ₹49 <span className="text-lg font-medium text-muted-foreground">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span><strong>100</strong> humanizations per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Standard processing speed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Basic support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full text-base font-semibold h-12" 
                variant={isBasic ? "outline" : "default"}
                disabled={isBasic || isPro || checkout.isPending}
                onClick={() => handleSubscribe("basic")}
              >
                {checkout.isPending && checkout.variables?.data.plan === "basic" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isBasic ? (
                  "Current Plan"
                ) : isPro ? (
                  "Included in Pro"
                ) : (
                  "Get Basic"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative flex flex-col border-primary shadow-xl ring-1 ring-primary/20 bg-primary/5">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <span className="bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm flex items-center gap-1">
                <Zap className="w-3 h-3" /> Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">Pro</CardTitle>
              <CardDescription className="text-base">For professionals and heavy users</CardDescription>
              <div className="mt-4 font-black text-4xl">
                ₹99 <span className="text-lg font-medium text-muted-foreground">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span><strong>Unlimited</strong> humanizations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Priority processing speed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Premium support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full text-base font-semibold h-12"
                variant={isPro ? "outline" : "default"}
                disabled={isPro || checkout.isPending}
                onClick={() => handleSubscribe("pro")}
              >
                {checkout.isPending && checkout.variables?.data.plan === "pro" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPro ? (
                  "Current Plan"
                ) : (
                  "Upgrade to Pro"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
