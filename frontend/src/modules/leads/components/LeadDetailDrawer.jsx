/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiPaperclip,
  FiSave,
  FiX,
} from "react-icons/fi";
import { ActionButton, Field, Input, Select, Textarea } from "../../../components/ui/SigmaForm";
import StatusBadge, { pretty } from "../../../components/ui/StatusBadge";
import { Card, Skeleton } from "./uiPrimitives";

const statusOptions = [
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

const FeedItem = ({ title, description, timestamp }) => (
  <div className="rounded-lg border border-white/10 bg-black/20 p-3">
    <p className="text-sm font-medium text-white">{title}</p>
    <p className="mt-1 text-xs text-slate-400">{description}</p>
    <p className="mt-2 text-[11px] text-slate-500">
      {timestamp ? new Date(timestamp).toLocaleString() : ""}
    </p>
  </div>
);

const LeadDetailDrawer = ({
  open,
  lead,
  users,
  dealers,
  timeline,
  notes,
  followups,
  loading,
  saving,
  noteDraft,
  setNoteDraft,
  followupDraft,
  setFollowupDraft,
  attachment,
  setAttachment,
  onClose,
  onMoveStatus,
  onAssignExecutive,
  onAssignDealer,
  onPatchProbability,
  onAddNote,
  onCreateFollowup,
  onCompleteFollowup,
  onRefresh,
}) => {
  const followupItems = useMemo(() => followups?.results || followups || [], [followups]);
  const noteItems = useMemo(() => notes?.results || notes || [], [notes]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 250 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-[var(--sigma-bg)] p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-red-300">Lead details</p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {lead?.lead_id} · {lead?.full_name}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {lead?.mobile_number} · {lead?.city}, {lead?.state}
                </p>
              </div>
              <button
                className="rounded-lg border border-white/15 p-2 text-slate-300 hover:bg-white/10"
                onClick={onClose}
              >
                <FiX />
              </button>
            </div>

            {!lead || loading ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <div className="space-y-4 pb-8">
                <Card className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <StatusBadge value={lead.status} />
                    <ActionButton tone="secondary" onClick={onRefresh}>
                      Refresh
                    </ActionButton>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Status">
                      <Select value={lead.status} onChange={(event) => onMoveStatus(event.target.value)}>
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {pretty(status)}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Probability">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={lead.conversion_probability || 0}
                        onChange={(event) => onPatchProbability(Number(event.target.value))}
                      />
                    </Field>
                    <Field label="Assign executive">
                      <Select
                        value={lead.assigned_executive || ""}
                        onChange={(event) => onAssignExecutive(event.target.value || null)}
                      >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name || user.username}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Assign dealer">
                      <Select
                        value={lead.assigned_dealer || ""}
                        onChange={(event) => onAssignDealer(event.target.value || null)}
                      >
                        <option value="">No dealer</option>
                        {dealers.map((dealer) => (
                          <option key={dealer.id} value={dealer.id}>
                            {dealer.name} · {dealer.city}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                </Card>

                <Card className="p-4">
                  <p className="mb-3 text-sm font-semibold text-white">Follow-ups</p>
                  <div className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
                    <Input
                      type="datetime-local"
                      value={followupDraft.scheduled_at}
                      onChange={(event) =>
                        setFollowupDraft((current) => ({
                          ...current,
                          scheduled_at: event.target.value,
                        }))
                      }
                    />
                    <Select
                      value={followupDraft.channel}
                      onChange={(event) =>
                        setFollowupDraft((current) => ({ ...current, channel: event.target.value }))
                      }
                    >
                      <option value="call">Call</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="meeting">Meeting</option>
                      <option value="email">Email</option>
                    </Select>
                    <ActionButton
                      onClick={onCreateFollowup}
                      disabled={!followupDraft.scheduled_at || saving}
                    >
                      <FiCalendar /> Schedule
                    </ActionButton>
                  </div>
                  <Textarea
                    className="mt-2"
                    value={followupDraft.outcome}
                    onChange={(event) =>
                      setFollowupDraft((current) => ({ ...current, outcome: event.target.value }))
                    }
                    placeholder="Outcome / context"
                  />
                  <div className="mt-3 space-y-2">
                    {followupItems.length ? (
                      followupItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs"
                        >
                          <div>
                            <p className="text-slate-200">
                              {item.channel?.toUpperCase()} ·{" "}
                              {new Date(item.scheduled_at).toLocaleString()}
                            </p>
                            <p className="text-slate-500">{item.outcome || "No outcome yet"}</p>
                          </div>
                          {!item.is_completed && (
                            <ActionButton onClick={() => onCompleteFollowup(item)}>
                              <FiCheckCircle /> Complete
                            </ActionButton>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">No follow-ups yet.</p>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <p className="mb-3 text-sm font-semibold text-white">Notes & Attachments</p>
                  <Textarea
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    placeholder="Capture discussion, objection, pricing note, next action."
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
                      <FiPaperclip />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(event) => setAttachment(event.target.files?.[0] || null)}
                      />
                      {attachment ? attachment.name : "Attach file"}
                    </label>
                    <ActionButton onClick={onAddNote} disabled={!noteDraft.trim() || saving}>
                      <FiSave /> Save note
                    </ActionButton>
                  </div>
                  <div className="mt-3 space-y-2">
                    {noteItems.map((item) => (
                      <FeedItem
                        key={item.id}
                        title="Note"
                        description={item.note || "Added note"}
                        timestamp={item.created_at}
                      />
                    ))}
                    {!noteItems.length && (
                      <p className="text-xs text-slate-500">
                        No notes yet. Added notes appear instantly here.
                      </p>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <p className="mb-3 text-sm font-semibold text-white">Live timeline</p>
                  <div className="space-y-2">
                    {(timeline || []).map((event) => (
                      <FeedItem
                        key={event.id}
                        title={pretty(event.action)}
                        description={event.message || "Activity captured"}
                        timestamp={event.created_at}
                      />
                    ))}
                    {!timeline?.length && (
                      <p className="flex items-center gap-2 text-xs text-slate-500">
                        <FiClock />
                        Timeline updates appear after status moves, notes, assignments, and follow-ups.
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default LeadDetailDrawer;
