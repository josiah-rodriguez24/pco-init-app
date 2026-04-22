"use client";

import { ResponsiveSankey } from "@nivo/sankey";
import type { SankeyNode, SankeyLink } from "@/lib/team-status/getWorshipTeamStatus";

interface SankeyChartProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  onNodeClick?: (nodeId: string) => void;
  onLinkClick?: (source: string, target: string) => void;
}

const BRANCH_COLORS: Record<string, string> = {
  "Worship Team": "hsl(220, 70%, 50%)",
  Band: "hsl(210, 75%, 55%)",
  Vocals: "hsl(330, 65%, 55%)",
  // Band instruments
  Guitar: "hsl(200, 60%, 50%)",
  Bass: "hsl(190, 55%, 45%)",
  Drums: "hsl(180, 50%, 50%)",
  Keys: "hsl(170, 55%, 50%)",
  Tracks: "hsl(160, 45%, 50%)",
  Strings: "hsl(150, 50%, 50%)",
  Brass: "hsl(140, 50%, 50%)",
  // Vocal roles
  "Worship Leader": "hsl(340, 60%, 55%)",
  "Co-Leader": "hsl(350, 55%, 55%)",
  Vocalist: "hsl(320, 50%, 55%)",
};

function getNodeColor(nodeId: string): string {
  return BRANCH_COLORS[nodeId] ?? "hsl(220, 40%, 55%)";
}

function NodeTooltip({ node }: { node: { id: string; value: number } }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <span className="font-semibold">{node.id}</span>
      <span className="ml-2 tabular-nums text-muted">{node.value}</span>
    </div>
  );
}

function LinkTooltip({
  link,
}: {
  link: { source: { id: string }; target: { id: string }; value: number };
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <span className="text-muted">
        {link.source.id} → {link.target.id}
      </span>
      <span className="ml-2 tabular-nums font-semibold">{link.value}</span>
    </div>
  );
}

export function SankeyChart({
  nodes,
  links,
  onNodeClick,
  onLinkClick,
}: SankeyChartProps) {
  const data = { nodes, links };

  if (nodes.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center text-sm text-muted">
        No worship team data available yet. Sync your Planning Center data to
        see the breakdown.
      </div>
    );
  }

  const leafNodeCount = nodes.filter(
    (n) => !["Worship Team", "Band", "Vocals"].includes(n.id)
  ).length;
  const dynamicHeight = Math.max(400, leafNodeCount * 55 + 120);

  return (
    <div className="w-full" style={{ height: `${dynamicHeight}px` }}>
      <ResponsiveSankey
        data={data}
        margin={{ top: 24, right: 180, bottom: 24, left: 24 }}
        align="justify"
        colors={(node) => getNodeColor(node.id as string)}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.3}
        nodeThickness={18}
        nodeSpacing={16}
        nodeBorderWidth={0}
        nodeBorderRadius={4}
        linkOpacity={0.45}
        linkHoverOpacity={0.75}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        enableLinkGradient
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={16}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 0.8]],
        }}
        nodeTooltip={({ node }) => (
          <NodeTooltip node={{ id: node.id as string, value: node.value }} />
        )}
        linkTooltip={({ link }) => (
          <LinkTooltip
            link={{
              source: { id: link.source.id as string },
              target: { id: link.target.id as string },
              value: link.value,
            }}
          />
        )}
        onClick={(data) => {
          if ("id" in data && typeof data.id === "string") {
            onNodeClick?.(data.id);
          } else if (
            "source" in data &&
            "target" in data &&
            typeof data.source === "object" &&
            typeof data.target === "object" &&
            data.source !== null &&
            data.target !== null &&
            "id" in data.source &&
            "id" in data.target
          ) {
            onLinkClick?.(data.source.id as string, data.target.id as string);
          }
        }}
        animate
        motionConfig="gentle"
      />
    </div>
  );
}
