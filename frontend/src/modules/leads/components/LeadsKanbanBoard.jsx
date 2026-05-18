import { AnimatePresence, motion } from "framer-motion";
import { FiClock } from "react-icons/fi";
import StatusBadge, { pretty } from "../../../components/ui/StatusBadge";
import EmptyState from "../../../components/ui/EmptyState";
import { Card, Skeleton } from "./uiPrimitives";

const statusColumns = [
  "new",
  "attempted_contact",
  "contacted",
  "interested",
  "negotiation",
  "dealer_assigned",
  "converted",
  "lost",
  "closed",
];

const LeadsKanbanBoard = ({
  leads,
  loading,
  error,
  onOpenLead,
  onMoveLead,
  movingLeadId,
}) => {
  const grouped = statusColumns.map((status) => ({
    status,
    leads: leads.filter((lead) => lead.status === status),
  }));

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="p-4">
            <Skeleton className="mb-4 h-5 w-28" />
            <Skeleton className="mb-3 h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState title="Failed to load leads">
        Please retry. API request for pipeline data failed.
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-4 overflow-x-auto pb-2 xl:grid-cols-4 2xl:grid-cols-8">
      {grouped.map((column) => (
        <Card
          key={column.status}
          className="min-h-[340px] p-3"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const id = event.dataTransfer.getData("lead-id");
            if (!id) return;
            const lead = leads.find((item) => String(item.id) === id);
            if (lead && lead.status !== column.status) onMoveLead(lead, column.status);
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <StatusBadge value={column.status} />
            <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400">
              {column.leads.length}
            </span>
          </div>
          <AnimatePresence initial={false}>
            <div className="space-y-3">
              {column.leads.map((lead) => (
                <motion.button
                  key={lead.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  type="button"
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("lead-id", String(lead.id))}
                  onClick={() => onOpenLead(lead.id)}
                  className="w-full rounded-lg border border-white/15 bg-white/5 p-3 text-left transition hover:border-red-400/60 hover:bg-white/10"
                >
                  <p className="line-clamp-1 font-semibold text-white">{lead.full_name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {lead.city}, {lead.state}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{lead.interested_product_sku || "Product open"}</span>
                    <span>{lead.conversion_probability || 0}%</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                    <FiClock />
                    {lead.next_followup_at
                      ? new Date(lead.next_followup_at).toLocaleString()
                      : "No follow-up"}
                  </div>
                  {movingLeadId === lead.id && (
                    <p className="mt-2 text-[11px] text-amber-300">Updating status…</p>
                  )}
                </motion.button>
              ))}
              {!column.leads.length && (
                <div className="rounded-lg border border-dashed border-white/10 p-3 text-xs text-slate-500">
                  Drop leads into {pretty(column.status)}
                </div>
              )}
            </div>
          </AnimatePresence>
        </Card>
      ))}
    </div>
  );
};

export default LeadsKanbanBoard;
