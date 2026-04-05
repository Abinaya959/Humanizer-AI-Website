import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useHumanizeText } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Copy, Sparkles, Loader2, LockKeyhole, ArrowRight, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

export default function Home() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const humanize = useHumanizeText();

  const handleHumanize = () => {
    if (!token) {
      setLocation("/login");
      return;
    }
    
    if (!input.trim() || input.length < 10) {
      toast({ title: "Input too short", description: "Please enter at least 10 characters.", variant: "destructive" });
      return;
    }

    setUsedFallback(false);
    humanize.mutate(
      { data: { text: input } },
      {
        onSuccess: (res) => {
          setOutput(res.humanizedText);
          setUsedFallback(res.usedFallback ?? false);
          // Optimistically update user usage
          queryClient.setQueryData(getGetMeQueryKey(), (old: any) => {
            if (!old) return old;
            return {
              ...old,
              usageCount: res.usageCount,
              freeLimit: res.freeLimit,
            };
          });
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Failed to humanize text";
          toast({
            title: "Error",
            description: msg,
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard", duration: 2000 });
  };

  const isLimitReached = user && !user.isPremium && user.usageCount >= user.freeLimit;
  const charsLeft = 5000 - input.length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl flex-1 flex flex-col">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
            Write like a human. <span className="text-primary">Instantly.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform robotic AI text into natural, engaging prose that bypasses detectors and connects with readers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-[500px]">
          {/* Input Side */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Input</span>
              <span className={`text-xs ${charsLeft < 0 ? 'text-destructive' : ''}`}>
                {input.length} / 5000
              </span>
            </label>
            <div className="relative flex-1 flex flex-col">
              <Textarea
                placeholder="Paste your AI-generated text here..."
                className="flex-1 resize-none p-6 text-base leading-relaxed bg-white border-border focus-visible:ring-primary shadow-sm rounded-xl"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={5000}
              />
              <div className="absolute bottom-4 right-4">
                {isLimitReached ? (
                  <Button asChild className="shadow-lg font-semibold gap-2 rounded-full px-6" size="lg">
                    <Link href="/pricing">
                      <LockKeyhole className="w-4 h-4" />
                      Unlock Pro
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    onClick={handleHumanize} 
                    disabled={humanize.isPending || !input.trim() || input.length < 10}
                    className="shadow-lg font-semibold gap-2 rounded-full px-6 transition-all hover:scale-105 active:scale-95"
                    size="lg"
                  >
                    {humanize.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Humanize Text
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Output Side */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Output</span>
              {output && (
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 px-2 text-xs">
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              )}
            </label>
            {usedFallback && output && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                <span className="text-amber-500">⚡</span>
                <span>Using basic humanization (AI unavailable)</span>
              </div>
            )}
            <div className="flex-1 rounded-xl border border-border bg-card shadow-sm p-6 overflow-auto relative group">
              {output ? (
                <div className="text-base leading-relaxed text-card-foreground whitespace-pre-wrap">
                  {output}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
                  <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-center font-medium">Your humanized text will appear here.</p>
                </div>
              )}
              
              {output && (
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button onClick={handleCopy} variant="secondary" size="icon" className="rounded-full shadow-md">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Usage Indicator */}
        {user && !user.isPremium && (
          <div className="mt-8 max-w-md mx-auto w-full">
            <Card className="p-4 bg-secondary/30 border-none shadow-none flex flex-col gap-3">
              <div className="flex justify-between text-sm font-medium">
                <span>Free uses remaining</span>
                <span className="text-primary">{Math.max(0, user.freeLimit - user.usageCount)} / {user.freeLimit}</span>
              </div>
              <Progress value={(user.usageCount / user.freeLimit) * 100} className="h-2" />
              {isLimitReached && (
                <p className="text-sm text-center text-muted-foreground mt-1">
                  You've reached your free limit. <Link href="/pricing" className="text-primary hover:underline font-semibold">Upgrade to continue.</Link>
                </p>
              )}
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
