import { OrganizationCard } from '../OrganizationCard'

export default function OrganizationCardExample() {
  return (
    <div className="max-w-sm">
      <OrganizationCard 
        name="Clean Water Initiative"
        mission="Providing safe drinking water to communities in need across 45 countries"
        category="Water & Sanitation"
        verified={true}
      />
    </div>
  )
}
