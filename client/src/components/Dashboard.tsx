import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCard } from "./GoalCard";
import { Plus, Target, TrendingUp, DollarSign } from "lucide-react";

//todo: remove mock functionality
const mockGoals = [
  {
    title: "Run 10km This Week",
    organization: "Clean Water Initiative",
    progress: 6.5,
    target: 10,
    unit: "km",
    daysRemaining: 4,
    pledgeAmount: 50,
    status: "active" as const,
  },
  {
    title: "Read 5 Books This Month",
    organization: "Education For All",
    progress: 2,
    target: 5,
    unit: "books",
    daysRemaining: 2,
    pledgeAmount: 100,
    status: "approaching" as const,
  },
  {
    title: "Meditate 20 Days",
    organization: "Global Health Alliance",
    progress: 18,
    target: 20,
    unit: "days",
    daysRemaining: 8,
    pledgeAmount: 75,
    status: "active" as const,
  },
];

const stats = [
  { icon: Target, label: "Active Goals", value: "3", color: "text-primary" },
  { icon: TrendingUp, label: "Completion Rate", value: "82%", color: "text-accent" },
  { icon: DollarSign, label: "Total Pledged", value: "$225", color: "text-destructive" },
];

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Goals</h1>
            <p className="text-muted-foreground">Track your progress and make an impact</p>
          </div>
          <Button size="lg" data-testid="button-create-goal">
            <Plus className="h-5 w-5 mr-2" />
            Create New Goal
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat) => (
            <Card key={stat.label} data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {mockGoals.map((goal) => (
            <GoalCard key={goal.title} {...goal} />
          ))}
        </div>
      </div>
    </div>
  );
}
