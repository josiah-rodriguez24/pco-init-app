import { TeamStatusContainer } from "@/components/team-status/TeamStatusContainer";
import { getWorshipTeamStatus } from "@/lib/team-status/getWorshipTeamStatus";

export default async function TeamStatusPage() {
  const data = await getWorshipTeamStatus();

  return (
    <div className="space-y-8">
      <TeamStatusContainer data={data} />
    </div>
  );
}
