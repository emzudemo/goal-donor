import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, MapPin, TrendingUp } from "lucide-react";

interface OrganizationCardProps {
  name: string;
  summary?: string | null;
  mission: string;
  category: string;
  verified?: boolean;
  imageUrl?: string | null;
  city?: string | null;
  country?: string | null;
  progressPercentage?: number | null;
  donatedAmountInCents?: number | null;
  openAmountInCents?: number | null;
}

export function OrganizationCard({ 
  name, 
  summary,
  mission, 
  category, 
  verified = true,
  imageUrl,
  city,
  country,
  progressPercentage,
  donatedAmountInCents,
  openAmountInCents
}: OrganizationCardProps) {
  const location = [city, country].filter(Boolean).join(", ");
  const totalAmountInCents = (donatedAmountInCents || 0) + (openAmountInCents || 0);
  const donatedAmount = (donatedAmountInCents || 0) / 100;
  const totalAmount = totalAmountInCents / 100;
  
  return (
    <Card className="hover-elevate cursor-pointer transition-all overflow-hidden h-full flex flex-col" data-testid={`card-organization-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      {imageUrl && (
        <div className="w-full h-48 overflow-hidden bg-muted">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="space-y-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{name}</CardTitle>
          {verified && (
            <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="w-fit">{category}</Badge>
          {location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{location}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="leading-relaxed line-clamp-3">
          {summary || mission}
        </CardDescription>
        
        {typeof progressPercentage === 'number' && progressPercentage >= 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-primary">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">{progressPercentage}% funded</span>
              </div>
              {totalAmount > 0 && (
                <span className="text-muted-foreground">
                  €{donatedAmount.toLocaleString()} raised
                </span>
              )}
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
