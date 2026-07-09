import { TeamStatusContainer } from "@/components/team-status/TeamStatusContainer";
import { getWorshipTeamStatus } from "@/lib/team-status/getWorshipTeamStatus";

/** Requires live DB — avoid static prerender at build time. */
export const dynamic = "force-dynamic";

export default async function TeamStatusPage() {
  const data = await getWorshipTeamStatus();

  return (
    <TeamStatusContainer data={data} />
  );
}
