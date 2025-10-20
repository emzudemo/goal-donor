import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface OrganizationCardProps {
  name: string;
  mission: string;
  category: string;
  verified?: boolean;
}

export function OrganizationCard({ name, mission, category, verified = true }: OrganizationCardProps) {
  return (
    <Card className="hover-elevate cursor-pointer transition-all" data-testid={`card-organization-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{name}</CardTitle>
          {verified && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="w-fit">{category}</Badge>
      </CardHeader>
      <CardContent>
        <CardDescription className="leading-relaxed">
          {mission}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
