import { prisma } from "@/lib/db";
import {
  resolveAllRoleTags,
  getBranches,
  getSankeyRoleTags,
  isWorshipPosition,
  isWorshipTeamName,
  getRoleDefinition,
  ROLE_DEFINITIONS,
  type Branch,
} from "./roleTaxonomy";
import { computeTier, type Tier } from "./tiers";

// ---------------------------------------------------------------------------
// Shared types consumed by both the Sankey chart and the DataGrid.
// These cross the server/client boundary via serialized props.
// ---------------------------------------------------------------------------

export interface PositionBreakdown {
  position: string;
  count: number;
  lastServed: string | null;
}

export interface TeamMemberRow {
  personKey: string;
  personName: string;
  roleTags: string[];
  branches: string[];
  isMultiRole: boolean;
  tier: Tier;
  scheduledCount: number;
  lastServed: string | null;
  positionBreakdown: PositionBreakdown[];
  demandByPosition: Record<string, number>;
}

export interface SankeyNode {
  id: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface TeamStatusData {
  sankeyNodes: SankeyNode[];
  sankeyLinks: SankeyLink[];
  members: TeamMemberRow[];
}

// ---------------------------------------------------------------------------
// Main aggregation
// ---------------------------------------------------------------------------

export async function getWorshipTeamStatus(): Promise<TeamStatusData> {
  const rows = await prisma.planPerson.findMany({
    where: { teamName: { not: null } },
    select: {
      personId: true,
      personExternalId: true,
      personName: true,
      teamName: true,
      position: true,
      plan: { select: { sortDate: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const worshipRows = rows.filter(
    (r) => isWorshipTeamName(r.teamName) || isWorshipPosition(r.position)
  );

  // Aggregate by person (prefer personExternalId → personId → name)
  const personMap = new Map<
    string,
    {
      personName: string;
      positions: string[];
      dates: (Date | null)[];
      positionDates: Map<string, Date[]>;
    }
  >();

  for (const row of worshipRows) {
    const key =
      row.personExternalId ??
      row.personId ??
      row.personName.toLowerCase();
    const existing = personMap.get(key);
    const pos = row.position ?? null;

    if (existing) {
      if (pos) existing.positions.push(pos);
      existing.dates.push(row.plan.sortDate);
      if (pos && row.plan.sortDate) {
        const arr = existing.positionDates.get(pos) ?? [];
        arr.push(row.plan.sortDate);
        existing.positionDates.set(pos, arr);
      }
    } else {
      const positionDates = new Map<string, Date[]>();
      if (pos && row.plan.sortDate) {
        positionDates.set(pos, [row.plan.sortDate]);
      }
      personMap.set(key, {
        personName: row.personName,
        positions: pos ? [pos] : [],
        dates: [row.plan.sortDate],
        positionDates,
      });
    }
  }

  // Load needed positions demand (aggregate across all plans)
  const neededPositions = await prisma.neededPosition.findMany({
    select: { teamPositionName: true, quantity: true },
  });
  const demandMap = new Map<string, number>();
  for (const np of neededPositions) {
    if (np.teamPositionName) {
      const key = np.teamPositionName.trim().toLowerCase();
      demandMap.set(key, (demandMap.get(key) ?? 0) + np.quantity);
    }
  }

  // Also load roster-level skill assignments for enrichment
  const rosterAssignments = await prisma.personTeamPositionAssignment.findMany({
    include: {
      person: { select: { externalId: true } },
      teamPosition: { select: { name: true } },
    },
  });
  const rosterSkillsByPerson = new Map<string, Set<string>>();
  for (const a of rosterAssignments) {
    const pKey = a.person.externalId;
    if (!rosterSkillsByPerson.has(pKey)) {
      rosterSkillsByPerson.set(pKey, new Set());
    }
    rosterSkillsByPerson.get(pKey)!.add(a.teamPosition.name);
  }

  // Build member rows with multi-role support
  const members: TeamMemberRow[] = [];
  for (const [key, data] of personMap) {
    // Merge historical positions with roster assignments
    const allPositions = [...data.positions];
    const rosterExtras = rosterSkillsByPerson.get(key);
    if (rosterExtras) {
      for (const pos of rosterExtras) {
        if (!allPositions.includes(pos)) {
          allPositions.push(pos);
        }
      }
    }

    const roleTags = resolveAllRoleTags(allPositions);
    const branches = getBranches(roleTags);
    const tier = computeTier(data.positions.length);

    const lastDate = data.dates
      .filter((d): d is Date => d != null)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    // Build per-position breakdown from actual serving history
    const positionBreakdown: PositionBreakdown[] = [];
    const posFreq = new Map<string, number>();
    for (const p of data.positions) {
      posFreq.set(p, (posFreq.get(p) ?? 0) + 1);
    }
    for (const [pos, count] of posFreq) {
      const posDates = data.positionDates.get(pos) ?? [];
      const lastPosDate = posDates.sort((a, b) => b.getTime() - a.getTime())[0];
      positionBreakdown.push({
        position: pos,
        count,
        lastServed: lastPosDate
          ? lastPosDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : null,
      });
    }
    positionBreakdown.sort((a, b) => b.count - a.count);

    // Per-position demand from needed_positions
    const demandByPosition: Record<string, number> = {};
    for (const pos of allPositions) {
      const demand = demandMap.get(pos.trim().toLowerCase());
      if (demand != null && demand > 0) {
        demandByPosition[pos] = demand;
      }
    }

    if (roleTags.size === 0) continue;

    members.push({
      personKey: key,
      personName: data.personName,
      roleTags: [...roleTags],
      branches: [...branches],
      isMultiRole: branches.size > 1 || roleTags.size > 1,
      tier,
      scheduledCount: data.positions.length,
      lastServed: lastDate
        ? lastDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : null,
      positionBreakdown,
      demandByPosition,
    });
  }

  members.sort((a, b) => b.scheduledCount - a.scheduledCount);

  const { sankeyNodes, sankeyLinks } = buildSankey(members);

  return { sankeyNodes, sankeyLinks, members };
}

// ---------------------------------------------------------------------------
// Sankey builder — skill-membership based (intentional duplication)
// ---------------------------------------------------------------------------

function buildSankey(members: TeamMemberRow[]): {
  sankeyNodes: SankeyNode[];
  sankeyLinks: SankeyLink[];
} {
  const ROOT = "Worship Team";

  // Count skill memberships per branch and per role
  const branchCounts: Record<Branch, number> = { band: 0, vocals: 0 };
  const roleCounts = new Map<string, number>();

  for (const m of members) {
    const sankeyTags = getSankeyRoleTags(new Set(m.roleTags));
    const memberBranches = new Set<Branch>();

    for (const tag of sankeyTags) {
      roleCounts.set(tag, (roleCounts.get(tag) ?? 0) + 1);
      const def = getRoleDefinition(tag);
      if (def) memberBranches.add(def.branch);
    }

    for (const branch of memberBranches) {
      branchCounts[branch]++;
    }
  }

  const nodes: SankeyNode[] = [{ id: ROOT }];
  const links: SankeyLink[] = [];

  // Branch nodes
  const branchEntries: [Branch, string][] = [
    ["band", "Band"],
    ["vocals", "Vocals"],
  ];

  for (const [branch, label] of branchEntries) {
    const count = branchCounts[branch];
    if (count === 0) continue;

    nodes.push({ id: label });
    links.push({ source: ROOT, target: label, value: count });

    // Role nodes under this branch
    const branchRoles = ROLE_DEFINITIONS
      .filter((r) => r.branch === branch && r.isSankeyNode)
      .sort((a, b) => {
        const ca = roleCounts.get(a.tag) ?? 0;
        const cb = roleCounts.get(b.tag) ?? 0;
        return cb - ca;
      });

    for (const role of branchRoles) {
      const count = roleCounts.get(role.tag) ?? 0;
      if (count === 0) continue;
      nodes.push({ id: role.label });
      links.push({ source: label, target: role.label, value: count });
    }
  }

  return { sankeyNodes: nodes, sankeyLinks: links };
}
