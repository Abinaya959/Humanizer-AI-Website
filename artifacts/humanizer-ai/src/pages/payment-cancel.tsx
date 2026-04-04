import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCcw } from "lucide-react";
import { Link } from "wouter";

export default function PaymentCancel() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md shadow-xl border-border text-center">
          <CardHeader className="space-y-4">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Payment Cancelled</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Your checkout process was incomplete. No charges were made.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">If you experienced an issue during checkout, you can try again.</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t p-6">
            <Button asChild className="w-full h-11 font-semibold gap-2">
              <Link href="/pricing">
                <RefreshCcw className="w-4 h-4" /> Try Again
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full h-11">
              <Link href="/">Return Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
