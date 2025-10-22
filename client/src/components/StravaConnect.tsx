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
  const [athleteId, setAthleteId] = useState<string>("");
  const { toast } = useToast();

  const checkStatus = async () => {
    setLoading(true);
    try {
      const storedAthleteId = localStorage.getItem("stravaAthleteId") || "";
      setAthleteId(storedAthleteId);
      
      if (storedAthleteId) {
        const response = await fetch(`/api/strava/status?athleteId=${storedAthleteId}`);
        const data = await response.json();
        setStatus(data);
      } else {
        setStatus({ connected: false });
      }
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
      const athleteId = params.get("athleteId");
      if (athleteId) {
        localStorage.setItem("stravaAthleteId", athleteId);
        setAthleteId(athleteId);
      }
      toast({
        title: "Strava Connected!",
        description: "Your Strava account has been successfully connected.",
      });
      window.history.replaceState({}, "", window.location.pathname);
      checkStatus();
    } else if (params.get("strava") === "error") {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Strava. Please try again.",
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
        body: JSON.stringify({ athleteId }),
      });

      if (response.ok) {
        localStorage.removeItem("stravaAthleteId");
        setStatus({ connected: false });
        setAthleteId("");
        toast({
          title: "Disconnected",
          description: "Your Strava account has been disconnected.",
        });
      }
    } catch (error) {
      console.error("Error disconnecting Strava:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect Strava. Please try again.",
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
            Connected
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1" data-testid="badge-strava-disconnected">
            <XCircle className="h-3 w-3" />
            Not Connected
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {status.connected
            ? `Connected as ${status.athleteName}. Your fitness activities will automatically sync to your goals.`
            : "Connect your Strava account to automatically track your fitness progress."}
        </CardDescription>

        {loading ? (
          <Button disabled data-testid="button-strava-loading">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        ) : status.connected ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={checkStatus}
              data-testid="button-strava-refresh"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              data-testid="button-strava-disconnect"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            className="gap-2"
            data-testid="button-strava-connect"
          >
            <SiStrava className="h-4 w-4" />
            Connect to Strava
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
