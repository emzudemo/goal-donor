import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function CTASection() {
  return (
    <section className="py-24 px-6 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Turn Your Goals Into Impact
        </h2>
        <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
          Every goal you set can make a difference. Start your journey today and support causes that matter.
        </p>
        <Link href="/dashboard">
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8"
            data-testid="button-get-started"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
