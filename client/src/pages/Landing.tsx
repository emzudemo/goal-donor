import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Heart, TrendingUp, Zap } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Landing() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "An unexpected error occurred",
      });
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: error.message,
        });
      } else if (data.user) {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Target className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              GoalGuard
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Turn your goals into meaningful impact. Set personal challenges, stay accountable, 
              and support charitable causes when you need extra motivation.
            </p>

            {/* Authentication Card */}
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Get Started</CardTitle>
                  <CardDescription className="text-center">
                    Sign up or sign in to start setting goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="signin" data-testid="tab-signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="signin">
                      <form onSubmit={handleEmailSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email">Email</Label>
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            data-testid="input-signin-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signin-password">Password</Label>
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            data-testid="input-signin-password"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={loading}
                          data-testid="button-signin-submit"
                        >
                          {loading ? "Signing in..." : "Sign In"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup">
                      <form onSubmit={handleEmailSignUp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            data-testid="input-signup-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            data-testid="input-signup-password"
                          />
                          <p className="text-xs text-muted-foreground">
                            Password must be at least 6 characters
                          </p>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={loading}
                          data-testid="button-signup-submit"
                        >
                          {loading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline"
                      onClick={() => handleSignIn('google')}
                      data-testid="button-login-google"
                    >
                      Google
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSignIn('github')}
                      data-testid="button-login-github"
                    >
                      GitHub
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Set goals, track progress, and make a difference
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Set Your Goal</CardTitle>
              <CardDescription>
                Create personal challenges with clear targets and deadlines. 
                Track fitness, reading, learning, or any measurable goal.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Choose a Cause</CardTitle>
              <CardDescription>
                Select a verified charitable organization. If you don't reach your goal, 
                your pledge supports a cause you care about.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Track & Achieve</CardTitle>
              <CardDescription>
                Monitor your progress with visual tracking. Connect Strava for automatic 
                fitness updates and stay motivated.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Strava Integration Section */}
      <div className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Powered by Strava</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Connect your Strava account for automatic activity tracking. 
              Your runs, rides, and workouts sync seamlessly to update your fitness goals.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <Card className="border-2 bg-primary/5">
          <CardContent className="pt-12 pb-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Ready to start?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join GoalGuard today and turn your personal growth into positive impact.
              </p>
              <p className="text-muted-foreground">
                Scroll up to create your account and get started!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>GoalGuard - Turn your goals into meaningful impact</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
