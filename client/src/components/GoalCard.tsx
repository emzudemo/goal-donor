import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";

interface GoalCardProps {
  title: string;
  organization: string;
  progress: number;
  target: number;
  unit: string;
  daysRemaining: number;
  pledgeAmount: number;
  status: "active" | "approaching" | "completed" | "failed";
  onUpdateProgress?: () => void;
}

export function GoalCard({
  title,
  organization,
  progress,
  target,
  unit,
  daysRemaining,
  pledgeAmount,
  status,
  onUpdateProgress,
}: GoalCardProps) {
  const percentage = Math.round((progress / target) * 100);
  const isUrgent = daysRemaining <= 3 && status === "active";
  
  return (
    <Card 
      className={`hover-elevate transition-all ${isUrgent ? 'border-destructive' : status === 'completed' ? 'border-accent' : ''}`}
      data-testid={`card-goal-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge variant={status === "completed" ? "default" : isUrgent ? "destructive" : "secondary"}>
            {status === "completed" ? "Completed" : `${daysRemaining}d left`}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Supporting {organization}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {progress} / {target} {unit}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
          <p className="text-right text-2xl font-bold text-primary">{percentage}%</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{daysRemaining} days left</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">${pledgeAmount} pledge</span>
          </div>
        </div>
        
        {status !== "completed" && onUpdateProgress && (
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={onUpdateProgress}
              data-testid="button-update-progress"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Update Progress
            </Button>
            <Button 
              variant="secondary"
              data-testid="button-view-details"
            >
              Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
