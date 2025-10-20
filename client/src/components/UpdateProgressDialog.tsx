import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Goal } from "@shared/schema";
import { TrendingUp } from "lucide-react";

interface UpdateProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
}

export function UpdateProgressDialog({ open, onOpenChange, goal }: UpdateProgressDialogProps) {
  const [progress, setProgress] = useState(goal.progress.toString());
  const { toast } = useToast();

  const updateProgressMutation = useMutation({
    mutationFn: async (newProgress: number) => {
      return await apiRequest("PATCH", `/api/goals/${goal.id}`, { progress: newProgress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Progress updated!",
        description: "Keep up the great work!",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const newProgress = parseFloat(progress);
    if (isNaN(newProgress) || newProgress < 0) {
      toast({
        title: "Invalid progress",
        description: "Please enter a valid number.",
        variant: "destructive",
      });
      return;
    }
    updateProgressMutation.mutate(newProgress);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Update Progress
          </DialogTitle>
          <DialogDescription>
            Update your progress for: {goal.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="progress">Current Progress</Label>
            <div className="flex items-center gap-2">
              <Input
                id="progress"
                type="number"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                data-testid="input-update-progress"
              />
              <span className="text-sm text-muted-foreground">/ {goal.target} {goal.unit}</span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Current: <span className="font-semibold text-foreground">{goal.progress} {goal.unit}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Target: <span className="font-semibold text-foreground">{goal.target} {goal.unit}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-update">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateProgressMutation.isPending} data-testid="button-save-progress">
            {updateProgressMutation.isPending ? "Saving..." : "Save Progress"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
