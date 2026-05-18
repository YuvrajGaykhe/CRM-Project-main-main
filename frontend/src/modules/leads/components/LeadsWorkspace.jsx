/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiColumns, FiList, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import { ActionButton, Select } from "../../../components/ui/SigmaForm";
import useLeadsFiltersSync from "../hooks/useLeadsFiltersSync";
import useLeadsFiltersStore from "../store/leadsFiltersStore";
import LeadsKanbanBoard from "./LeadsKanbanBoard";
import LeadsTable, { fromStoreSort, toStoreSort } from "./LeadsTable";
import LeadDetailDrawer from "./LeadDetailDrawer";
import { Card } from "./uiPrimitives";
import {
  assignDealer,
  completeLeadFollowup,
  createLeadFollowup,
  createNote,
  fetchAssignmentData,
  fetchLeadAttachments,
  fetchFollowups,
  fetchLeadById,
  fetchLeadNotes,
  fetchLeads,
  fetchLeadTimeline,
  moveLeadStatus,
  patchLead,
  uploadLeadAttachment,
} from "../services/leadsApi";

const sources = [
  "website_form",
  "whatsapp",
  "dealer_inquiry",
  "distributor",
  "direct_call",
  "manual_entry",
  "social_media",
];
const statuses = [
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

const updateLeadInCache = (data, leadId, patch) => {
  if (!data) return data;
  const updateArray = (items) =>
    items.map((item) => (item.id === leadId ? { ...item, ...patch } : item));
  if (Array.isArray(data)) return updateArray(data);
  if (Array.isArray(data.results)) return { ...data, results: updateArray(data.results) };
  return data;
};

const LeadsWorkspace = ({ mode }) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLeadId = searchParams.get("leadId");
  const { filters, setFilter, resetFilters, queryParams } = useLeadsFiltersSync();
  const setGlobalFilter = useLeadsFiltersStore((state) => state.setFilter);

  const [noteDraft, setNoteDraft] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [followupDraft, setFollowupDraft] = useState({
    scheduled_at: "",
    channel: "call",
    outcome: "",
  });
  const [movingLeadId, setMovingLeadId] = useState(null);

  const leadsQuery = useQuery({
    queryKey: ["leads", queryParams],
    queryFn: () => fetchLeads(queryParams),
  });
  const assignmentQuery = useQuery({
    queryKey: ["leads", "assignment-options"],
    queryFn: fetchAssignmentData,
  });
  const leadDetailQuery = useQuery({
    queryKey: ["lead-detail", selectedLeadId],
    queryFn: () => fetchLeadById(selectedLeadId),
    enabled: Boolean(selectedLeadId),
    refetchInterval: selectedLeadId ? 30000 : false,
  });
  const timelineQuery = useQuery({
    queryKey: ["lead-timeline", selectedLeadId],
    queryFn: () => fetchLeadTimeline(selectedLeadId),
    enabled: Boolean(selectedLeadId),
    refetchInterval: selectedLeadId ? 15000 : false,
  });
  const notesQuery = useQuery({
    queryKey: ["lead-notes", selectedLeadId],
    queryFn: () => fetchLeadNotes(selectedLeadId),
    enabled: Boolean(selectedLeadId),
  });
  const attachmentsQuery = useQuery({
    queryKey: ["lead-attachments", selectedLeadId],
    queryFn: () => fetchLeadAttachments(selectedLeadId),
    enabled: Boolean(selectedLeadId),
  });
  const followupsQuery = useQuery({
    queryKey: ["lead-followups", selectedLeadId],
    queryFn: () => fetchFollowups(selectedLeadId),
    enabled: Boolean(selectedLeadId),
    refetchInterval: selectedLeadId ? 15000 : false,
  });

  const leads = useMemo(() => leadsQuery.data?.results || leadsQuery.data || [], [leadsQuery.data]);
  const selectedLead =
    leadDetailQuery.data ||
    leads.find((lead) => String(lead.id) === String(selectedLeadId)) ||
    null;

  const syncLeadPatch = (leadId, patch) => {
    queryClient.setQueriesData({ queryKey: ["leads"] }, (old) =>
      updateLeadInCache(old, leadId, patch)
    );
    queryClient.setQueryData(["lead-detail", String(leadId)], (old) =>
      old ? { ...old, ...patch } : old
    );
  };

  const moveMutation = useMutation({
    mutationFn: ({ lead, status }) => moveLeadStatus(lead.id, status),
    onMutate: async ({ lead, status }) => {
      setMovingLeadId(lead.id);
      await queryClient.cancelQueries({ queryKey: ["leads"] });
      const previous = queryClient.getQueriesData({ queryKey: ["leads"] });
      syncLeadPatch(lead.id, { status });
      return { previous };
    },
    onError: (_, __, context) =>
      context?.previous?.forEach(([key, value]) => queryClient.setQueryData(key, value)),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", String(vars.lead.id)] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail", String(vars.lead.id)] });
    },
    onSettled: () => {
      setMovingLeadId(null);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const patchLeadMutation = useMutation({
    mutationFn: ({ leadId, payload }) => patchLead(leadId, payload),
    onMutate: async ({ leadId, payload }) => syncLeadPatch(leadId, payload),
    onSuccess: (_, vars) =>
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", String(vars.leadId)] }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail", selectedLeadId] });
    },
  });

  const assignDealerMutation = useMutation({
    mutationFn: ({ leadId, dealerId }) => assignDealer(leadId, dealerId),
    onMutate: ({ leadId, dealerId }) => syncLeadPatch(leadId, { assigned_dealer: dealerId || null }),
    onSettled: (_, __, vars) => {
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", String(vars.leadId)] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail", String(vars.leadId)] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const noteMutation = useMutation({
    mutationFn: ({ leadId, note }) => createNote(leadId, note),
    onMutate: async ({ note }) => {
      const temp = { id: `temp-${Date.now()}`, note, created_at: new Date().toISOString() };
      queryClient.setQueryData(["lead-notes", selectedLeadId], (old) => {
        const list = old?.results || old || [];
        return Array.isArray(old) ? [temp, ...old] : { ...(old || {}), results: [temp, ...list] };
      });
    },
    onSuccess: () => {
      setNoteDraft("");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-notes", selectedLeadId] });
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", selectedLeadId] });
    },
  });

  const attachmentMutation = useMutation({
    mutationFn: ({ leadId, file }) => uploadLeadAttachment(leadId, file),
    onSuccess: () => {
      setAttachment(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-attachments", selectedLeadId] });
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", selectedLeadId] });
    },
  });

  const followupMutation = useMutation({
    mutationFn: (payload) => createLeadFollowup(payload),
    onMutate: async (payload) => {
      const temp = {
        id: `temp-${Date.now()}`,
        scheduled_at: payload.scheduled_at,
        channel: payload.channel,
        outcome: payload.outcome,
        is_completed: false,
      };
      queryClient.setQueryData(["lead-followups", selectedLeadId], (old) => {
        const list = old?.results || old || [];
        return Array.isArray(old) ? [temp, ...old] : { ...(old || {}), results: [temp, ...list] };
      });
      syncLeadPatch(payload.lead, { next_followup_at: payload.scheduled_at });
    },
    onSuccess: () => setFollowupDraft({ scheduled_at: "", channel: "call", outcome: "" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-followups", selectedLeadId] });
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", selectedLeadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail", selectedLeadId] });
    },
  });

  const followupCompleteMutation = useMutation({
    mutationFn: ({ followupId, outcome }) => completeLeadFollowup(followupId, outcome),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-followups", selectedLeadId] });
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", selectedLeadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail", selectedLeadId] });
    },
  });

  const saveTableSort = (sortingUpdater) => {
    const next =
      typeof sortingUpdater === "function"
        ? sortingUpdater(fromStoreSort(filters.sortBy, filters.sortDirection))
        : sortingUpdater;
    const mapped = toStoreSort(next);
    setGlobalFilter("sortBy", mapped.sortBy);
    setGlobalFilter("sortDirection", mapped.sortDirection);
  };

  const openLead = (leadId) => {
    const next = new URLSearchParams(searchParams);
    next.set("leadId", String(leadId));
    setSearchParams(next, { replace: true });
  };

  const closeLead = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("leadId");
    setSearchParams(next, { replace: true });
  };

  const handleAddNote = async () => {
    if (!selectedLead) return;

    const jobs = [];
    if (noteDraft.trim()) {
      jobs.push(
        noteMutation.mutateAsync({
          leadId: selectedLead.id,
          note: noteDraft,
        })
      );
    }
    if (attachment) {
      jobs.push(
        attachmentMutation.mutateAsync({
          leadId: selectedLead.id,
          file: attachment,
        })
      );
    }
    if (!jobs.length) return;
    await Promise.all(jobs);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase text-red-300">Lead Intelligence</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Leads Workspace</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Pipeline management with live timeline, follow-ups, notes, and assignment workflows.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/leads">
            <ActionButton tone={mode === "list" ? "primary" : "secondary"}>
              <FiList /> List
            </ActionButton>
          </Link>
          <Link to="/dashboard/leads/kanban">
            <ActionButton tone={mode === "kanban" ? "primary" : "secondary"}>
              <FiColumns /> Kanban
            </ActionButton>
          </Link>
          <ActionButton tone="secondary" onClick={() => leadsQuery.refetch()}>
            <FiRefreshCw /> Refresh
          </ActionButton>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px_auto]">
          <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            <FiSearch className="text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
              placeholder="Search by name, mobile, city, lead id"
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />
          </label>
          <Select value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
          <Select value={filters.source} onChange={(event) => setFilter("source", event.target.value)}>
            <option value="">All sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
          <Select value={filters.sortBy} onChange={(event) => setFilter("sortBy", event.target.value)}>
            <option value="updated_at">Sort: Updated</option>
            <option value="created_at">Sort: Created</option>
            <option value="full_name">Sort: Name</option>
            <option value="next_followup_at">Sort: Follow-up</option>
            <option value="status">Sort: Status</option>
          </Select>
          <div className="flex gap-2">
            <ActionButton
              tone="secondary"
              onClick={() => setFilter("sortDirection", filters.sortDirection === "desc" ? "asc" : "desc")}
            >
              {filters.sortDirection === "desc" ? "Desc" : "Asc"}
            </ActionButton>
            <ActionButton tone="secondary" onClick={resetFilters}>
              <FiX /> Clear
            </ActionButton>
          </div>
        </div>
      </Card>

      {mode === "kanban" ? (
        <LeadsKanbanBoard
          leads={leads}
          loading={leadsQuery.isLoading}
          error={leadsQuery.isError}
          movingLeadId={movingLeadId}
          onOpenLead={openLead}
          onMoveLead={(lead, status) => moveMutation.mutate({ lead, status })}
        />
      ) : (
        <LeadsTable
          leads={leads}
          loading={leadsQuery.isLoading}
          error={leadsQuery.isError}
          sorting={fromStoreSort(filters.sortBy, filters.sortDirection)}
          setSorting={saveTableSort}
          onOpenLead={openLead}
        />
      )}

      <LeadDetailDrawer
        open={Boolean(selectedLeadId)}
        lead={selectedLead}
        loading={leadDetailQuery.isLoading}
        saving={
          moveMutation.isPending ||
          patchLeadMutation.isPending ||
          followupMutation.isPending ||
          noteMutation.isPending ||
          attachmentMutation.isPending
        }
        users={assignmentQuery.data?.users || []}
        dealers={assignmentQuery.data?.dealers || []}
        timeline={timelineQuery.data || []}
        notes={notesQuery.data || []}
        attachments={attachmentsQuery.data || []}
        followups={followupsQuery.data || []}
        noteDraft={noteDraft}
        setNoteDraft={setNoteDraft}
        followupDraft={followupDraft}
        setFollowupDraft={setFollowupDraft}
        attachment={attachment}
        setAttachment={setAttachment}
        onClose={closeLead}
        onRefresh={() => {
          leadDetailQuery.refetch();
          timelineQuery.refetch();
          notesQuery.refetch();
          attachmentsQuery.refetch();
          followupsQuery.refetch();
        }}
        onMoveStatus={(status) => selectedLead && moveMutation.mutate({ lead: selectedLead, status })}
        onPatchProbability={(value) =>
          selectedLead &&
          patchLeadMutation.mutate({
            leadId: selectedLead.id,
            payload: { conversion_probability: value },
          })
        }
        onAssignExecutive={(userId) =>
          selectedLead &&
          patchLeadMutation.mutate({
            leadId: selectedLead.id,
            payload: { assigned_executive: userId },
          })
        }
        onAssignDealer={(dealerId) =>
          selectedLead &&
          assignDealerMutation.mutate({
            leadId: selectedLead.id,
            dealerId,
          })
        }
        onAddNote={handleAddNote}
        onCreateFollowup={() =>
          selectedLead &&
          followupMutation.mutate({
            lead: selectedLead.id,
            scheduled_at: followupDraft.scheduled_at,
            channel: followupDraft.channel,
            assigned_to: selectedLead.assigned_executive || null,
            outcome: followupDraft.outcome,
          })
        }
        onCompleteFollowup={(item) =>
          followupCompleteMutation.mutate({
            followupId: item.id,
            outcome: item.outcome || "Completed from leads drawer",
          })
        }
      />
    </div>
  );
};

export default LeadsWorkspace;
