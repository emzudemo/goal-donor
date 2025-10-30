import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Heart, TrendingUp, Zap } from "lucide-react";

export default function Landing() {
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
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-signup"
              >
                Sign In
              </Button>
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
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-cta-login"
              >
                Create Your First Goal
              </Button>
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
