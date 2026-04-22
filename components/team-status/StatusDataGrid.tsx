"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { ArrowUpDown, X, ChevronDown, ChevronUp } from "lucide-react";
import type { TeamMemberRow } from "@/lib/team-status/getWorshipTeamStatus";
import type { Tier } from "@/lib/team-status/tiers";
import { TIER_META } from "@/lib/team-status/tiers";
import { getRoleLabel } from "@/lib/team-status/roleTaxonomy";

interface StatusDataGridProps {
  data: TeamMemberRow[];
  activeFilter: string | null;
  onClearFilter: () => void;
}

const columnHelper = createColumnHelper<TeamMemberRow>();

const tierColors: Record<Tier, string> = {
  A: "bg-success/10 text-success",
  B: "bg-primary/10 text-primary",
  C: "bg-warning/10 text-warning",
  D: "bg-muted/20 text-muted",
};

const BRANCH_TAG_COLORS: Record<string, string> = {
  band: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  vocals: "bg-pink-500/15 text-pink-700 dark:text-pink-300",
};

function RoleTagChip({ tag }: { tag: string }) {
  const label = getRoleLabel(tag);
  const branchColor =
    tag === "band" || tag === "vocals"
      ? BRANCH_TAG_COLORS[tag]
      : undefined;
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
        branchColor ?? "bg-surface text-foreground/70"
      }`}
    >
      {label}
    </span>
  );
}

const columns = [
  columnHelper.accessor("personName", {
    header: "Name",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{info.getValue()}</span>
          {row.isMultiRole && (
            <span className="inline-flex items-center rounded-full bg-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
              Multi
            </span>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor("roleTags", {
    header: "Roles",
    cell: (info) => {
      const tags = info.getValue();
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <RoleTagChip key={tag} tag={tag} />
          ))}
        </div>
      );
    },
    enableSorting: false,
  }),
  columnHelper.accessor("tier", {
    header: "Tier",
    cell: (info) => {
      const tier = info.getValue();
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tierColors[tier]}`}
        >
          {TIER_META[tier].label} &middot; {TIER_META[tier].description}
        </span>
      );
    },
  }),
  columnHelper.accessor("scheduledCount", {
    header: "Times Served",
    cell: (info) => {
      const val = info.getValue();
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 rounded-full bg-surface">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary"
              style={{ width: `${Math.min(val / 15, 1) * 100}%` }}
            />
          </div>
          <span className="tabular-nums">{val}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("lastServed", {
    header: "Last Served",
    cell: (info) => info.getValue() ?? "—",
  }),
];

const FILTER_NODE_TO_TAGS: Record<string, string[]> = {
  "Worship Team": [],
  Band: ["guitar", "bass", "drums", "keys", "tracks", "strings", "brass"],
  Vocals: ["worship-leader", "co-leader", "vocalist"],
  Guitar: ["guitar"],
  Bass: ["bass"],
  Drums: ["drums"],
  Keys: ["keys"],
  Tracks: ["tracks"],
  Strings: ["strings"],
  Brass: ["brass"],
  "Worship Leader": ["worship-leader"],
  "Co-Leader": ["co-leader"],
  Vocalist: ["vocalist"],
};

export function StatusDataGrid({
  data,
  activeFilter,
  onClearFilter,
}: StatusDataGridProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredData = useMemo(() => {
    if (!activeFilter) return data;
    if (activeFilter === "Worship Team") return data;

    const requiredTags = FILTER_NODE_TO_TAGS[activeFilter];
    if (!requiredTags || requiredTags.length === 0) return data;

    return data.filter((m) =>
      requiredTags.some((tag) => m.roleTags.includes(tag))
    );
  }, [data, activeFilter]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  function toggleRow(personKey: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(personKey)) {
        next.delete(personKey);
      } else {
        next.add(personKey);
      }
      return next;
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Team Members</h3>
          {activeFilter && (
            <button
              onClick={onClearFilter}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20 cursor-pointer"
            >
              {activeFilter}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums text-muted">
            {filteredData.length} member{filteredData.length !== 1 ? "s" : ""}
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-primary/50"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                <th className="w-8 px-2 py-3" />
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted transition-colors hover:text-foreground"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-12 text-center text-sm text-muted"
                >
                  No worship team members found. Sync your Planning Center data
                  to populate this view.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const member = row.original;
                const isExpanded = expandedRows.has(member.personKey);
                const hasBreakdown =
                  member.positionBreakdown.length > 0 ||
                  Object.keys(member.demandByPosition).length > 0;

                return (
                  <RowGroup key={row.id}>
                    <tr className="transition-colors hover:bg-surface/50">
                      <td className="w-8 px-2 py-3.5">
                        {hasBreakdown && (
                          <button
                            onClick={() => toggleRow(member.personKey)}
                            className="flex h-5 w-5 items-center justify-center rounded text-muted transition-colors hover:bg-surface hover:text-foreground cursor-pointer"
                            aria-label={
                              isExpanded ? "Collapse details" : "Expand details"
                            }
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </td>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-3.5">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && hasBreakdown && (
                      <tr className="bg-surface/30">
                        <td />
                        <td
                          colSpan={columns.length}
                          className="px-6 py-3"
                        >
                          <ExpandedDetail member={member} />
                        </td>
                      </tr>
                    )}
                  </RowGroup>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function ExpandedDetail({ member }: { member: TeamMemberRow }) {
  const hasDemand = Object.keys(member.demandByPosition).length > 0;

  return (
    <div className="flex gap-8">
      {member.positionBreakdown.length > 0 && (
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            Served by Position
          </h4>
          <div className="space-y-1">
            {member.positionBreakdown.map((pb) => (
              <div key={pb.position} className="flex items-center gap-3 text-xs">
                <span className="w-36 truncate font-medium">
                  {pb.position}
                </span>
                <span className="tabular-nums text-muted">{pb.count}x</span>
                {pb.lastServed && (
                  <span className="text-muted/60">last {pb.lastServed}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {hasDemand && (
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            Open Demand
          </h4>
          <div className="space-y-1">
            {Object.entries(member.demandByPosition).map(([pos, count]) => (
              <div key={pos} className="flex items-center gap-3 text-xs">
                <span className="w-36 truncate font-medium">{pos}</span>
                <span className="tabular-nums text-warning">
                  {count} unfilled
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
