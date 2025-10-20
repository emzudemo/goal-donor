import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/Runner_celebrating_goal_achievement_5782294c.png";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function Hero() {
  return (
    <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Turn Your Goals Into Impact
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
          Set ambitious goals, support causes you believe in, and hold yourself accountable. When you commit, everyone wins.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/dashboard">
            <Button 
              size="lg" 
              variant="default"
              data-testid="button-start-goal"
              className="text-lg px-8"
            >
              Start Your First Goal
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline"
            data-testid="button-how-it-works"
            className="text-lg px-8 bg-background/20 backdrop-blur-sm border-white/30 text-white hover:bg-background/30"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            How It Works
          </Button>
        </div>
        <p className="mt-12 text-white/80 text-sm">
          Over 50,000 goals tracked • $250K+ donated to causes
        </p>
      </div>
    </section>
  );
}
