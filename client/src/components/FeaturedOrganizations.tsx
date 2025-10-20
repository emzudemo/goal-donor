import { OrganizationCard } from "./OrganizationCard";
import { useQuery } from "@tanstack/react-query";
import { type Organization } from "@shared/schema";

export function FeaturedOrganizations() {
  const { data: organizations = [], isLoading } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  const featuredOrgs = organizations.slice(0, 4);

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Featured Organizations</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Support verified charitable organizations making real impact
          </p>
        </div>
        
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading organizations...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredOrgs.map((org) => (
              <OrganizationCard key={org.id} {...org} verified={org.verified === 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
