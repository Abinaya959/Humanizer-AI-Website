import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, PenTool, Zap } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, token } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl hover:opacity-80 transition-opacity">
            <PenTool className="w-6 h-6" />
            Humanizer AI
          </Link>
          
          <nav className="flex items-center gap-4">
            {token && user ? (
              <>
                <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                  Pricing
                </Link>
                <div className="h-4 w-[1px] bg-border mx-2" />
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{user.name}</span>
                  <Badge variant={user.isPremium ? "default" : "secondary"} className="uppercase text-[10px] tracking-wider px-2 py-0.5">
                    {user.plan}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                  Pricing
                </Link>
                <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                  Log in
                </Link>
                <Button asChild className="rounded-full shadow-md font-semibold">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
