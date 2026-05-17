import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiCalendar, FiCheckCircle, FiClock, FiPlus, FiSave, FiUser } from "react-icons/fi";

import EmptyState from "../../components/ui/EmptyState";
import { ActionButton, Field, Input, Select, Textarea } from "../../components/ui/SigmaForm";
import SigmaModal from "../../components/ui/SigmaModal";
import StatusBadge, { pretty } from "../../components/ui/StatusBadge";
import {
  completeFollowup,
  completeSigmaTask,
  createFollowup,
  createSigmaTask,
  getDealers,
  getEnterpriseUsers,
  getFollowups,
  getLeads,
  getSigmaTasks,
  updateSigmaTask,
} from "../../services/api/crm";

const blankTask = {
  title: "",
  description: "",
  task_type: "followup",
  status: "todo",
  priority: "medium",
  due_at: "",
  assigned_to: "",
  lead: "",
  dealer: "",
};

const blankFollowup = {
  lead: "",
  scheduled_at: "",
  channel: "call",
  assigned_to: "",
  outcome: "",
};

const normalize = (payload) =>
  Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, value === "" ? null : value]));

const SigmaTasksPage = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("tasks");
  const [taskOpen, setTaskOpen] = useState(false);
  const [followupOpen, setFollowupOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState(blankTask);
  const [followupDraft, setFollowupDraft] = useState(blankFollowup);

  const tasksQuery = useQuery({
    queryKey: ["sigma-tasks", "phase-two"],
    queryFn: () => getSigmaTasks({ page_size: 100 }),
  });
  const followupsQuery = useQuery({
    queryKey: ["sigma-followups", "phase-two"],
    queryFn: () => getFollowups({ page_size: 100 }),
  });
  const leadsQuery = useQuery({ queryKey: ["leads", "task-form"], queryFn: () => getLeads({ page_size: 100 }) });
  const dealersQuery = useQuery({ queryKey: ["dealers", "task-form"], queryFn: () => getDealers({ page_size: 100 }) });
  const usersQuery = useQuery({ queryKey: ["users", "task-form"], queryFn: () => getEnterpriseUsers({ page_size: 100 }) });

  const tasks = tasksQuery.data?.results || tasksQuery.data || [];
  const followups = followupsQuery.data?.results || followupsQuery.data || [];
  const leads = leadsQuery.data?.results || leadsQuery.data || [];
  const dealers = dealersQuery.data?.results || dealersQuery.data || [];
  const users = usersQuery.data?.results || usersQuery.data || [];

  const stats = useMemo(
    () => ({
      open: tasks.filter((task) => !["done", "cancelled"].includes(task.status)).length,
      followups: followups.filter((followup) => followup.status === "scheduled").length,
      overdue: followups.filter((followup) => followup.status === "scheduled" && new Date(followup.scheduled_at) < new Date()).length,
    }),
    [tasks, followups]
  );

  const createTaskMutation = useMutation({
    mutationFn: (payload) => createSigmaTask(normalize(payload)),
    onSuccess: () => {
      setTaskDraft(blankTask);
      setTaskOpen(false);
      queryClient.invalidateQueries({ queryKey: ["sigma-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise-analytics"] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }) => updateSigmaTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sigma-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise-analytics"] });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: completeSigmaTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sigma-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise-analytics"] });
    },
  });

  const createFollowupMutation = useMutation({
    mutationFn: (payload) => createFollowup(normalize(payload)),
    onSuccess: () => {
      setFollowupDraft(blankFollowup);
      setFollowupOpen(false);
      queryClient.invalidateQueries({ queryKey: ["sigma-followups"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise-analytics"] });
    },
  });

  const completeFollowupMutation = useMutation({
    mutationFn: (id) => completeFollowup(id, "Completed from sales operations queue."),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sigma-followups"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise-analytics"] });
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase text-red-300">Sales Operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Tasks & Follow-ups</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Callback schedules, dealer onboarding work, overdue follow-ups, and sales execution ownership.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton tone="secondary" onClick={() => setFollowupOpen(true)}>
            <FiCalendar />
            Schedule Follow-up
          </ActionButton>
          <ActionButton onClick={() => setTaskOpen(true)}>
            <FiPlus />
            New Task
          </ActionButton>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
          <FiClock className="text-amber-300" />
          <p className="mt-4 text-2xl font-semibold text-white">{stats.open}</p>
          <p className="text-sm text-slate-400">Open tasks</p>
        </div>
        <div className="rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
          <FiCalendar className="text-sky-300" />
          <p className="mt-4 text-2xl font-semibold text-white">{stats.followups}</p>
          <p className="text-sm text-slate-400">Scheduled follow-ups</p>
        </div>
        <div className="rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
          <FiCheckCircle className="text-red-300" />
          <p className="mt-4 text-2xl font-semibold text-white">{stats.overdue}</p>
          <p className="text-sm text-slate-400">Overdue follow-ups</p>
        </div>
      </div>

      <div className="flex gap-2 rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-2">
        <ActionButton tone={tab === "tasks" ? "primary" : "secondary"} onClick={() => setTab("tasks")}>Tasks</ActionButton>
        <ActionButton tone={tab === "followups" ? "primary" : "secondary"} onClick={() => setTab("followups")}>Follow-ups</ActionButton>
      </div>

      {tab === "tasks" ? (
        <div className="rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
          <p className="text-sm font-semibold text-white">Execution Queue</p>
          <div className="mt-4 space-y-3">
            {tasks.length ? (
              tasks.map((task) => (
                <div key={task.id} className="grid gap-3 rounded-lg bg-white/5 p-4 lg:grid-cols-[1fr_160px_160px_auto] lg:items-center">
                  <div>
                    <p className="font-semibold text-white">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{task.lead_uid || task.dealer_name || "Internal"} | {pretty(task.task_type)}</p>
                  </div>
                  <StatusBadge value={task.status} />
                  <span className="text-sm capitalize text-slate-400">{task.priority}</span>
                  <div className="flex gap-2">
                    <Select value={task.status} onChange={(event) => updateTaskMutation.mutate({ id: task.id, payload: { status: event.target.value } })}>
                      {["todo", "in_progress", "blocked", "done", "cancelled"].map((status) => <option key={status} value={status}>{pretty(status)}</option>)}
                    </Select>
                    <ActionButton tone="success" onClick={() => completeTaskMutation.mutate(task.id)} disabled={task.status === "done"}>
                      <FiCheckCircle />
                    </ActionButton>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No tasks queued">Tasks generated from follow-up and dealer workflows will appear here.</EmptyState>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
          <p className="text-sm font-semibold text-white">Follow-up Calendar</p>
          <div className="mt-4 space-y-3">
            {followups.length ? (
              followups.map((followup) => (
                <div key={followup.id} className="grid gap-3 rounded-lg bg-white/5 p-4 lg:grid-cols-[1fr_180px_160px_auto] lg:items-center">
                  <div>
                    <p className="font-semibold text-white">{followup.lead_name}</p>
                    <p className="mt-1 text-xs text-slate-400">{followup.lead_uid} | {pretty(followup.channel)}</p>
                  </div>
                  <span className="text-sm text-slate-300">{new Date(followup.scheduled_at).toLocaleString()}</span>
                  <StatusBadge value={followup.status} />
                  <ActionButton tone="success" onClick={() => completeFollowupMutation.mutate(followup.id)} disabled={followup.status === "completed"}>
                    <FiCheckCircle />
                    Complete
                  </ActionButton>
                </div>
              ))
            ) : (
              <EmptyState title="No follow-ups scheduled">Schedule callbacks and WhatsApp follow-ups from lead workflows.</EmptyState>
            )}
          </div>
        </div>
      )}

      <SigmaModal open={taskOpen} title="Create Task" onClose={() => setTaskOpen(false)}>
        <form onSubmit={(event) => { event.preventDefault(); createTaskMutation.mutate(taskDraft); }} className="grid gap-4 md:grid-cols-2">
          <Field label="Title"><Input required value={taskDraft.title} onChange={(event) => setTaskDraft({ ...taskDraft, title: event.target.value })} /></Field>
          <Field label="Type"><Select value={taskDraft.task_type} onChange={(event) => setTaskDraft({ ...taskDraft, task_type: event.target.value })}>{["followup", "callback", "meeting", "dealer_onboarding", "support", "internal"].map((type) => <option key={type} value={type}>{pretty(type)}</option>)}</Select></Field>
          <Field label="Priority"><Select value={taskDraft.priority} onChange={(event) => setTaskDraft({ ...taskDraft, priority: event.target.value })}>{["low", "medium", "high", "urgent"].map((priority) => <option key={priority} value={priority}>{pretty(priority)}</option>)}</Select></Field>
          <Field label="Due at"><Input type="datetime-local" value={taskDraft.due_at} onChange={(event) => setTaskDraft({ ...taskDraft, due_at: event.target.value })} /></Field>
          <Field label="Assigned to"><Select value={taskDraft.assigned_to} onChange={(event) => setTaskDraft({ ...taskDraft, assigned_to: event.target.value })}><option value="">Unassigned</option>{users.map((user) => <option key={user.id} value={user.id}>{user.full_name || user.username}</option>)}</Select></Field>
          <Field label="Lead"><Select value={taskDraft.lead} onChange={(event) => setTaskDraft({ ...taskDraft, lead: event.target.value })}><option value="">No lead</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.lead_id} | {lead.full_name}</option>)}</Select></Field>
          <Field label="Dealer"><Select value={taskDraft.dealer} onChange={(event) => setTaskDraft({ ...taskDraft, dealer: event.target.value })}><option value="">No dealer</option>{dealers.map((dealer) => <option key={dealer.id} value={dealer.id}>{dealer.name}</option>)}</Select></Field>
          <div className="md:col-span-2"><Field label="Description"><Textarea value={taskDraft.description} onChange={(event) => setTaskDraft({ ...taskDraft, description: event.target.value })} /></Field></div>
          <div className="flex justify-end gap-3 md:col-span-2">
            <ActionButton tone="secondary" onClick={() => setTaskOpen(false)}>Cancel</ActionButton>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50" disabled={createTaskMutation.isPending}>
              <FiSave />
              Save Task
            </button>
          </div>
        </form>
      </SigmaModal>

      <SigmaModal open={followupOpen} title="Schedule Follow-up" onClose={() => setFollowupOpen(false)}>
        <form onSubmit={(event) => { event.preventDefault(); createFollowupMutation.mutate(followupDraft); }} className="grid gap-4 md:grid-cols-2">
          <Field label="Lead"><Select required value={followupDraft.lead} onChange={(event) => setFollowupDraft({ ...followupDraft, lead: event.target.value })}><option value="">Select lead</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.lead_id} | {lead.full_name}</option>)}</Select></Field>
          <Field label="Scheduled at"><Input required type="datetime-local" value={followupDraft.scheduled_at} onChange={(event) => setFollowupDraft({ ...followupDraft, scheduled_at: event.target.value })} /></Field>
          <Field label="Channel"><Select value={followupDraft.channel} onChange={(event) => setFollowupDraft({ ...followupDraft, channel: event.target.value })}>{["call", "whatsapp", "email", "meeting", "site_visit"].map((channel) => <option key={channel} value={channel}>{pretty(channel)}</option>)}</Select></Field>
          <Field label="Assigned to"><Select value={followupDraft.assigned_to} onChange={(event) => setFollowupDraft({ ...followupDraft, assigned_to: event.target.value })}><option value="">Unassigned</option>{users.map((user) => <option key={user.id} value={user.id}>{user.full_name || user.username}</option>)}</Select></Field>
          <div className="md:col-span-2"><Field label="Outcome / context"><Textarea value={followupDraft.outcome} onChange={(event) => setFollowupDraft({ ...followupDraft, outcome: event.target.value })} /></Field></div>
          <div className="flex justify-end gap-3 md:col-span-2">
            <ActionButton tone="secondary" onClick={() => setFollowupOpen(false)}>Cancel</ActionButton>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50" disabled={createFollowupMutation.isPending}>
              <FiCalendar />
              Schedule
            </button>
          </div>
        </form>
      </SigmaModal>
    </div>
  );
};

export default SigmaTasksPage;
