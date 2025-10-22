import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCard } from "./GoalCard";
import { CreateGoalDialog } from "./CreateGoalDialog";
import { UpdateProgressDialog } from "./UpdateProgressDialog";
import { StravaConnect } from "./StravaConnect";
import { Plus, Target, TrendingUp, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Goal, type Organization } from "@shared/schema";

export function Dashboard() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    return org?.name || "Unknown Organization";
  };

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getGoalStatus = (goal: Goal): "active" | "approaching" | "completed" | "failed" => {
    if (goal.status === "completed") return "completed";
    if (goal.status === "failed") return "failed";
    const daysLeft = getDaysRemaining(goal.deadline);
    if (daysLeft <= 3) return "approaching";
    return "active";
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const totalPledged = goals.reduce((sum, g) => sum + g.pledgeAmount, 0);
  const completionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;

  const handleUpdateProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setUpdateDialogOpen(true);
  };

  if (goalsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Goals</h1>
            <p className="text-muted-foreground">Track your progress and make an impact</p>
          </div>
          <Button size="lg" onClick={() => setCreateDialogOpen(true)} data-testid="button-create-goal">
            <Plus className="h-5 w-5 mr-2" />
            Create New Goal
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card data-testid="stat-active-goals">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Goals
              </CardTitle>
              <Target className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeGoals.length}</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-completion-rate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{completionRate}%</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-pledged">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pledged
              </CardTitle>
              <DollarSign className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${totalPledged}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <StravaConnect />
        </div>
        
        {goals.length === 0 ? (
          <div className="text-center py-16">
            <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No goals yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first goal to start making an impact
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-first-goal">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goalId={goal.id}
                title={goal.title}
                organization={getOrganizationName(goal.organizationId)}
                progress={goal.progress}
                target={goal.target}
                unit={goal.unit}
                daysRemaining={getDaysRemaining(goal.deadline)}
                pledgeAmount={goal.pledgeAmount}
                status={getGoalStatus(goal)}
                onUpdateProgress={() => handleUpdateProgress(goal)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateGoalDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      {selectedGoal && (
        <UpdateProgressDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          goal={selectedGoal}
        />
      )}
    </div>
  );
}
