import { Target, Heart, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Target,
    title: "Set Your Goal",
    description: "Choose a personal challenge with a clear deadline. Run 10km, read 5 books, or create your own custom goal.",
  },
  {
    icon: Heart,
    title: "Choose a Cause",
    description: "Select from verified charitable organizations. Pick a cause that matters to you and motivates your success.",
  },
  {
    icon: TrendingUp,
    title: "Make Your Commitment",
    description: "Pledge an amount you'll donate if you don't reach your goal. Track progress and stay accountable.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your goals into meaningful impact
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center" data-testid={`step-${index + 1}`}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
