import { GoalCard } from '../GoalCard'

export default function GoalCardExample() {
  return (
    <div className="max-w-md space-y-6">
      <GoalCard
        title="Run 10km This Week"
        organization="Clean Water Initiative"
        progress={6.5}
        target={10}
        unit="km"
        daysRemaining={4}
        pledgeAmount={50}
        status="active"
      />
      <GoalCard
        title="Read 5 Books This Month"
        organization="Education For All"
        progress={2}
        target={5}
        unit="books"
        daysRemaining={2}
        pledgeAmount={100}
        status="approaching"
      />
    </div>
  )
}
