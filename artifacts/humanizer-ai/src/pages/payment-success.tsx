import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function PaymentSuccess() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md shadow-xl border-border text-center">
          <CardHeader className="space-y-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Payment Successful!</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Thank you for subscribing. Your account has been upgraded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">You can now enjoy your premium features and higher limits immediately.</p>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-6">
            <Button asChild className="w-full h-11 font-semibold gap-2">
              <Link href="/">
                Start Humanizing <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
