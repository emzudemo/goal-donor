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
import { ArrowLeft, ArrowRight, Calendar, Euro } from "lucide-react";

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getDeadlineDate = (option: string): Date => {
  const now = new Date();
  const date = new Date(now);
  
  switch (option) {
    case "this-week":
      // End of this week (Sunday)
      const daysUntilSunday = 7 - now.getDay();
      date.setDate(now.getDate() + daysUntilSunday);
      break;
    case "next-week":
      // End of next week (Sunday)
      const daysUntilNextSunday = 7 - now.getDay() + 7;
      date.setDate(now.getDate() + daysUntilNextSunday);
      break;
    case "this-month":
      // End of this month
      date.setMonth(now.getMonth() + 1, 0);
      break;
    case "next-month":
      // End of next month
      date.setMonth(now.getMonth() + 2, 0);
      break;
  }
  
  return date;
};

const formatDeadlineOption = (option: string): string => {
  const date = getDeadlineDate(option);
  return date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric', year: 'numeric' });
};

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
        title: "Ziel erstellt!",
        description: "Dein Ziel wurde erfolgreich erstellt. Bleib engagiert!",
      });
      resetForm();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Ziel konnte nicht erstellt werden. Bitte versuche es erneut.",
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
        title: "Fehlende Informationen",
        description: "Bitte fülle alle Zieldetails aus.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !formData.organizationId) {
      toast({
        title: "Organisation auswählen",
        description: "Bitte wähle eine gemeinnützige Organisation zur Unterstützung.",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    if (!formData.pledgeAmount || parseFloat(formData.pledgeAmount) <= 0) {
      toast({
        title: "Ungültiger Spendenbetrag",
        description: "Bitte gib einen gültigen Spendenbetrag ein.",
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
      deadline: getDeadlineDate(formData.deadline).toISOString() as any,
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
          <DialogTitle className="text-2xl">Neues Ziel erstellen</DialogTitle>
          <DialogDescription>
            Schritt {step} von 3: {step === 1 ? "Zieldetails" : step === 2 ? "Organisation wählen" : "Verpflichtung festlegen"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Goal Details */}
        {step === 1 && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Zieltitel</Label>
              <Input
                id="title"
                placeholder="z.B. 10 km diese Woche laufen"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-goal-title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target">Zielwert</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="Beispiel: 10"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  data-testid="input-goal-target"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Einheit</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger data-testid="select-goal-unit">
                    <SelectValue placeholder="Einheit wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="km">Kilometer (km)</SelectItem>
                    <SelectItem value="miles">Meilen</SelectItem>
                    <SelectItem value="hours">Stunden</SelectItem>
                    <SelectItem value="days">Tage</SelectItem>
                    <SelectItem value="books">Bücher</SelectItem>
                    <SelectItem value="workouts">Trainingseinheiten</SelectItem>
                    <SelectItem value="other">Andere</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Frist</Label>
              <Select value={formData.deadline} onValueChange={(value) => setFormData({ ...formData, deadline: value })}>
                <SelectTrigger data-testid="select-goal-deadline">
                  <SelectValue placeholder="Frist wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">Diese Woche ({formatDeadlineOption("this-week")})</SelectItem>
                  <SelectItem value="next-week">Nächste Woche ({formatDeadlineOption("next-week")})</SelectItem>
                  <SelectItem value="this-month">Diesen Monat ({formatDeadlineOption("this-month")})</SelectItem>
                  <SelectItem value="next-month">Nächsten Monat ({formatDeadlineOption("next-month")})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Choose Organization */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Wähle eine gemeinnützige Organisation, die deine Spende erhält, wenn du dein Ziel nicht erreichst.
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
              <h3 className="font-semibold text-lg">Deine Zielzusammenfassung</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Ziel:</span> {formData.title}</p>
                <p><span className="text-muted-foreground">Zielwert:</span> {formData.target} {formData.unit}</p>
                <p><span className="text-muted-foreground">Frist:</span> {formData.deadline ? getDeadlineDate(formData.deadline).toLocaleDateString('de-DE') : ""}</p>
                <p><span className="text-muted-foreground">Unterstützt:</span> {selectedOrg?.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pledgeAmount">Spendenbetrag (EUR)</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pledgeAmount"
                  type="number"
                  placeholder="Beispiel: 50"
                  className="pl-10"
                  value={formData.pledgeAmount}
                  onChange={(e) => setFormData({ ...formData, pledgeAmount: e.target.value })}
                  data-testid="input-pledge-amount"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Dieser Betrag wird an {selectedOrg?.name} gespendet, wenn du dein Ziel bis zur Frist nicht erreichst.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={() => { resetForm(); onOpenChange(false); }} data-testid="button-cancel">
              Abbrechen
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} data-testid="button-next">
                Weiter
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={createGoalMutation.isPending} data-testid="button-create-goal">
                {createGoalMutation.isPending ? "Wird erstellt..." : "Ziel erstellen"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
