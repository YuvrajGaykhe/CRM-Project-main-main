import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FiExternalLink } from "react-icons/fi";
import StatusBadge, { pretty } from "../../../components/ui/StatusBadge";
import EmptyState from "../../../components/ui/EmptyState";
import { Card, Skeleton } from "./uiPrimitives";

const mapSortKey = {
  full_name: "full_name",
  status: "status",
  next_followup_at: "next_followup_at",
  updated_at: "updated_at",
};

const LeadsTable = ({ leads, loading, error, sorting, setSorting, onOpenLead }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: "full_name",
        header: "Lead",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-white">{row.original.full_name}</p>
            <p className="mt-1 text-xs text-slate-400">
              {row.original.mobile_number} · {row.original.lead_id}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge value={row.original.status} />,
      },
      {
        accessorKey: "lead_source",
        header: "Source",
        cell: ({ row }) => (
          <span className="text-slate-300">{pretty(row.original.lead_source)}</span>
        ),
      },
      {
        accessorKey: "next_followup_at",
        header: "Next Follow-up",
        cell: ({ row }) => (
          <span className="text-slate-300">
            {row.original.next_followup_at
              ? new Date(row.original.next_followup_at).toLocaleString()
              : "Not scheduled"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={() => onOpenLead(row.original.id)}
            className="inline-flex items-center gap-1 text-xs text-red-300 transition hover:text-red-200"
          >
            Open <FiExternalLink size={12} />
          </button>
        ),
      },
    ],
    [onOpenLead]
  );

  const table = useReactTable({
    data: leads,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: false,
  });

  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="mb-3 h-8 w-full" />
        <Skeleton className="mb-2 h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <EmptyState title="Failed to load leads">
        Unable to fetch list data from API.
      </EmptyState>
    );
  }

  if (!leads.length) {
    return (
      <EmptyState title="No leads found">
        Try clearing filters or sync new leads from sources.
      </EmptyState>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-slate-400">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-medium">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={header.column.getCanSort() ? "inline-flex items-center gap-1" : ""}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-[10px] text-slate-500">
                            {header.column.getIsSorted() === "desc"
                              ? "▼"
                              : header.column.getIsSorted() === "asc"
                                ? "▲"
                                : ""}
                          </span>
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-white/5">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export const toStoreSort = (sorting) => {
  if (!sorting?.length) return { sortBy: "updated_at", sortDirection: "desc" };
  const item = sorting[0];
  return {
    sortBy: mapSortKey[item.id] || "updated_at",
    sortDirection: item.desc ? "desc" : "asc",
  };
};

export const fromStoreSort = (sortBy, sortDirection) => {
  if (!sortBy) return [];
  return [{ id: mapSortKey[sortBy] || "updated_at", desc: sortDirection !== "asc" }];
};

export default LeadsTable;
