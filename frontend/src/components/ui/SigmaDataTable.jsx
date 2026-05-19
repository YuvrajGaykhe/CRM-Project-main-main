import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FiChevronDown, FiChevronUp, FiColumns, FiCheck } from "react-icons/fi";
import SigmaSkeleton from "./SigmaSkeleton";
import SigmaButton from "./SigmaButton";
import SigmaDropdown from "./SigmaDropdown";

const PAGE_SIZES = [20, 50, 100];

const SigmaDataTable = ({
  data = [],
  columns = [],
  loading = false,
  emptyTitle = "No data found",
  emptyMessage = "Records will appear here once available.",
  emptyAction,
  onRowClick,
  enableSelection = false,
  bulkActions = [],
  density = "comfortable",
  className = "",
}) => {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});

  const densityPadding = {
    compact: "px-3 py-1.5",
    comfortable: "px-4 py-2.5",
    spacious: "px-4 py-4",
  };

  const selectionColumn = useMemo(() => {
    if (!enableSelection) return [];
    return [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="h-3.5 w-3.5 rounded border-slate-600 bg-transparent accent-[var(--sigma-accent)]"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            className="h-3.5 w-3.5 rounded border-slate-600 bg-transparent accent-[var(--sigma-accent)]"
          />
        ),
        size: 40,
        enableSorting: false,
      },
    ];
  }, [enableSelection]);

  const allColumns = useMemo(
    () => [...selectionColumn, ...columns],
    [selectionColumn, columns]
  );

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, rowSelection, columnVisibility },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
    enableRowSelection: enableSelection,
  });

  const selectedCount = Object.keys(rowSelection).length;
  const pad = densityPadding[density] || densityPadding.comfortable;

  // Column visibility items for dropdown
  const columnVisibilityItems = table
    .getAllLeafColumns()
    .filter((col) => col.id !== "select")
    .map((col) => ({
      id: col.id,
      label: typeof col.columnDef.header === "string" ? col.columnDef.header : col.id,
      icon: col.getIsVisible() ? FiCheck : undefined,
      onClick: () => col.toggleVisibility(),
    }));

  if (loading) {
    return (
      <div className={`rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-4 ${className}`}>
        <SigmaSkeleton variant="table" count={8} />
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 ${className}`}>
      {/* Toolbar: bulk actions + column visibility */}
      {(selectedCount > 0 || columnVisibilityItems.length > 0) && (
        <div className="flex items-center justify-between border-b border-[var(--sigma-border)] px-4 py-2">
          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <>
                <span className="text-xs text-slate-400">
                  {selectedCount} selected
                </span>
                {bulkActions.map((action) => (
                  <SigmaButton
                    key={action.label}
                    variant={action.variant || "ghost"}
                    size="xs"
                    onClick={() => {
                      const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
                      action.onClick(selectedRows);
                      setRowSelection({});
                    }}
                  >
                    {action.icon && <action.icon className="h-3 w-3" />}
                    {action.label}
                  </SigmaButton>
                ))}
              </>
            )}
          </div>
          <SigmaDropdown
            trigger={
              <SigmaButton variant="ghost" size="xs">
                <FiColumns className="h-3.5 w-3.5" />
                Columns
              </SigmaButton>
            }
            items={columnVisibilityItems}
            align="right"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[var(--sigma-border)]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`${pad} text-left text-xs font-medium uppercase tracking-wider text-slate-400 ${
                      header.column.getCanSort() ? "cursor-pointer select-none hover:text-slate-200" : ""
                    }`}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" && <FiChevronUp className="h-3 w-3" />}
                      {header.column.getIsSorted() === "desc" && <FiChevronDown className="h-3 w-3" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-white/5">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={allColumns.length}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-slate-300">{emptyTitle}</p>
                    <p className="text-xs text-slate-500">{emptyMessage}</p>
                    {emptyAction && (
                      <SigmaButton variant="secondary" size="sm" onClick={emptyAction.onClick} className="mt-2">
                        {emptyAction.label}
                      </SigmaButton>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-white/[0.03]" : ""
                  } ${row.getIsSelected() ? "bg-[var(--sigma-accent)]/5" : ""}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={`${pad} text-sm text-slate-200`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.length > 20 && (
        <div className="flex items-center justify-between border-t border-[var(--sigma-border)] px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{data.length} records</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded border border-[var(--sigma-border)] bg-transparent px-2 py-1 text-xs text-slate-300"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <SigmaButton
              variant="ghost"
              size="xs"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Prev
            </SigmaButton>
            <span className="px-2 text-xs text-slate-400">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <SigmaButton
              variant="ghost"
              size="xs"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Next
            </SigmaButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default SigmaDataTable;
