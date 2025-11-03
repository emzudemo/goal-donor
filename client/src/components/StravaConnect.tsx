import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { SiStrava } from "react-icons/si";

interface StravaStatus {
  connected: boolean;
  athleteName?: string;
  athleteProfileUrl?: string;
}

export function StravaConnect() {
  const [status, setStatus] = useState<StravaStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/strava/status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error checking Strava status:", error);
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get("strava") === "connected") {
      toast({
        title: "Strava verbunden!",
        description: "Dein Strava-Konto wurde erfolgreich verbunden.",
      });
      window.history.replaceState({}, "", window.location.pathname);
      checkStatus();
    } else if (params.get("strava") === "error") {
      toast({
        title: "Verbindung fehlgeschlagen",
        description: "Verbindung zu Strava fehlgeschlagen. Bitte versuche es erneut.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

  const handleConnect = () => {
    window.location.href = "/api/strava/connect";
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch("/api/strava/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setStatus({ connected: false });
        toast({
          title: "Getrennt",
          description: "Dein Strava-Konto wurde getrennt.",
        });
      }
    } catch (error) {
      console.error("Error disconnecting Strava:", error);
      toast({
        title: "Fehler",
        description: "Strava konnte nicht getrennt werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card data-testid="card-strava-connect">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <SiStrava className="h-5 w-5 text-[#FC4C02]" />
          <CardTitle className="text-lg">Strava Integration</CardTitle>
        </div>
        {status.connected ? (
          <Badge variant="default" className="gap-1" data-testid="badge-strava-connected">
            <CheckCircle2 className="h-3 w-3" />
            Verbunden
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1" data-testid="badge-strava-disconnected">
            <XCircle className="h-3 w-3" />
            Nicht verbunden
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {status.connected
            ? `Verbunden als ${status.athleteName}. Deine Fitness-Aktivitäten werden automatisch mit deinen Zielen synchronisiert.`
            : "Verbinde dein Strava-Konto, um deinen Fitness-Fortschritt automatisch zu verfolgen."}
        </CardDescription>

        {loading ? (
          <Button disabled data-testid="button-strava-loading">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Lädt...
          </Button>
        ) : status.connected ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={checkStatus}
              data-testid="button-strava-refresh"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Status aktualisieren
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              data-testid="button-strava-disconnect"
            >
              Trennen
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            className="gap-2"
            data-testid="button-strava-connect"
          >
            <SiStrava className="h-4 w-4" />
            Mit Strava verbinden
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
