import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Organization, type InsertGoal } from "@shared/schema";
import { OrganizationCard } from "./OrganizationCard";
import { ArrowLeft, ArrowRight, Calendar, DollarSign } from "lucide-react";

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGoalDialog({ open, onOpenChange }: CreateGoalDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    target: "",
    unit: "",
    deadline: "",
    organizationId: "",
    pledgeAmount: "",
  });

  const { toast } = useToast();

  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
    enabled: open,
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: InsertGoal) => {
      return await apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal created!",
        description: "Your goal has been created successfully. Stay committed!",
      });
      resetForm();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setStep(1);
    setFormData({
      title: "",
      target: "",
      unit: "",
      deadline: "",
      organizationId: "",
      pledgeAmount: "",
    });
  };

  const handleNext = () => {
    if (step === 1 && (!formData.title || !formData.target || !formData.unit || !formData.deadline)) {
      toast({
        title: "Missing information",
        description: "Please fill in all goal details.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !formData.organizationId) {
      toast({
        title: "Select an organization",
        description: "Please choose a charitable organization to support.",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    if (!formData.pledgeAmount || parseFloat(formData.pledgeAmount) <= 0) {
      toast({
        title: "Invalid pledge amount",
        description: "Please enter a valid pledge amount.",
        variant: "destructive",
      });
      return;
    }

    const goalData: InsertGoal = {
      title: formData.title,
      organizationId: formData.organizationId,
      progress: 0,
      target: parseFloat(formData.target),
      unit: formData.unit,
      deadline: new Date(formData.deadline),
      pledgeAmount: parseFloat(formData.pledgeAmount),
      status: "active",
    };

    createGoalMutation.mutate(goalData);
  };

  const selectedOrg = organizations.find((org) => org.id === formData.organizationId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Goal</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {step === 1 ? "Goal Details" : step === 2 ? "Choose Organization" : "Set Commitment"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Goal Details */}
        {step === 1 && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                placeholder="e.g., Run 10km this week"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-goal-title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="10"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  data-testid="input-goal-target"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger data-testid="select-goal-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="km">Kilometers (km)</SelectItem>
                    <SelectItem value="miles">Miles</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="workouts">Workouts</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="deadline"
                  type="date"
                  className="pl-10"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="input-goal-deadline"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Choose Organization */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select a charitable organization that will receive your pledge if you don't reach your goal.
            </p>
            <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  onClick={() => setFormData({ ...formData, organizationId: org.id })}
                  className={`cursor-pointer transition-all ${
                    formData.organizationId === org.id ? "ring-2 ring-primary rounded-lg" : ""
                  }`}
                >
                  <OrganizationCard {...org} verified={org.verified === 1} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Set Commitment */}
        {step === 3 && (
          <div className="space-y-6 py-4">
            <div className="rounded-lg bg-muted/50 p-6 space-y-3">
              <h3 className="font-semibold text-lg">Your Goal Summary</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Goal:</span> {formData.title}</p>
                <p><span className="text-muted-foreground">Target:</span> {formData.target} {formData.unit}</p>
                <p><span className="text-muted-foreground">Deadline:</span> {new Date(formData.deadline).toLocaleDateString()}</p>
                <p><span className="text-muted-foreground">Supporting:</span> {selectedOrg?.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pledgeAmount">Pledge Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pledgeAmount"
                  type="number"
                  placeholder="50"
                  className="pl-10"
                  value={formData.pledgeAmount}
                  onChange={(e) => setFormData({ ...formData, pledgeAmount: e.target.value })}
                  data-testid="input-pledge-amount"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This amount will be donated to {selectedOrg?.name} if you don't reach your goal by the deadline.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={() => { resetForm(); onOpenChange(false); }} data-testid="button-cancel">
              Cancel
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} data-testid="button-next">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={createGoalMutation.isPending} data-testid="button-create-goal">
                {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
