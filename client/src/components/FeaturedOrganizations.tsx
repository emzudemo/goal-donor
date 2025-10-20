import { OrganizationCard } from "./OrganizationCard";

const organizations = [
  {
    name: "Clean Water Initiative",
    mission: "Providing safe drinking water to communities in need across 45 countries",
    category: "Water & Sanitation",
  },
  {
    name: "Wildlife Conservation Fund",
    mission: "Protecting endangered species and preserving natural habitats worldwide",
    category: "Environment",
  },
  {
    name: "Education For All",
    mission: "Building schools and providing quality education to underserved communities",
    category: "Education",
  },
  {
    name: "Global Health Alliance",
    mission: "Delivering medical care and disease prevention programs in developing nations",
    category: "Healthcare",
  },
];

export function FeaturedOrganizations() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Featured Organizations</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Support verified charitable organizations making real impact
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {organizations.map((org) => (
            <OrganizationCard key={org.name} {...org} />
          ))}
        </div>
      </div>
    </section>
  );
}
