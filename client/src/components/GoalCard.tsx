import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Euro, TrendingUp, RefreshCw } from "lucide-react";
import { SiStrava } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface GoalCardProps {
  goalId: string;
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
  goalId,
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
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const percentage = Math.round((progress / target) * 100);
  const isUrgent = daysRemaining <= 3 && status === "active";

  const handleStravaSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`/api/strava/sync/${goalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Synchronisation fehlgeschlagen");
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Synchronisiert!",
        description: "Dein Fortschritt wurde von Strava aktualisiert.",
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Synchronisation fehlgeschlagen",
        description: error instanceof Error ? error.message : "Synchronisation mit Strava fehlgeschlagen. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };
  
  return (
    <Card 
      className={`hover-elevate transition-all ${isUrgent ? 'border-destructive' : status === 'completed' ? 'border-accent' : ''}`}
      data-testid={`card-goal-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge variant={status === "completed" ? "default" : isUrgent ? "destructive" : "secondary"}>
            {status === "completed" ? "Abgeschlossen" : `${daysRemaining}T übrig`}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Unterstützt {organization}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Fortschritt</span>
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
            <span className="text-muted-foreground">{daysRemaining} Tage übrig</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">€{pledgeAmount} Spende</span>
          </div>
        </div>
        
        {status !== "completed" && onUpdateProgress && (
          <div className="flex gap-2 flex-wrap">
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={onUpdateProgress}
              data-testid="button-update-progress"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Fortschritt aktualisieren
            </Button>
            {(unit === "km" || unit === "miles") && (
              <Button
                variant="outline"
                onClick={handleStravaSync}
                disabled={syncing}
                data-testid="button-sync-strava"
              >
                {syncing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <SiStrava className="h-4 w-4 mr-2 text-[#FC4C02]" />
                )}
                {syncing ? "Synchronisierung..." : "Strava Sync"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
