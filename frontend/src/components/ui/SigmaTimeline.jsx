import {
  FiPlus,
  FiEdit,
  FiArrowRight,
  FiMessageSquare,
  FiUserCheck,
  FiCalendar,
  FiCheckCircle,
  FiUpload,
  FiDownload,
  FiAlertCircle,
} from "react-icons/fi";
import SigmaAvatar from "./SigmaAvatar";

const ACTION_ICONS = {
  "lead.created": FiPlus,
  "lead.updated": FiEdit,
  "lead.status_changed": FiArrowRight,
  "lead.note_added": FiMessageSquare,
  "lead.assigned": FiUserCheck,
  "lead.dealer_assigned": FiUserCheck,
  "lead.csv_imported": FiUpload,
  "lead.csv_exported": FiDownload,
  "followup.scheduled": FiCalendar,
  "followup.completed": FiCheckCircle,
  "dealer.created": FiPlus,
  "dealer.updated": FiEdit,
  "dealer.approved": FiCheckCircle,
  "task.created": FiPlus,
  "task.completed": FiCheckCircle,
  "attachment.created": FiUpload,
};

const ACTION_COLORS = {
  "lead.created": "text-sky-300 bg-sky-500/15",
  "lead.status_changed": "text-indigo-300 bg-indigo-500/15",
  "lead.note_added": "text-amber-300 bg-amber-500/15",
  "lead.assigned": "text-violet-300 bg-violet-500/15",
  "lead.dealer_assigned": "text-cyan-300 bg-cyan-500/15",
  "followup.scheduled": "text-blue-300 bg-blue-500/15",
  "followup.completed": "text-emerald-300 bg-emerald-500/15",
  "dealer.approved": "text-emerald-300 bg-emerald-500/15",
  "task.completed": "text-emerald-300 bg-emerald-500/15",
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const SigmaTimeline = ({ events = [], className = "" }) => {
  if (!events.length) {
    return (
      <div className={`py-6 text-center text-sm text-slate-500 ${className}`}>
        No activity yet
      </div>
    );
  }

  return (
    <div className={`relative space-y-0 ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-white/10" />

      {events.map((event, index) => {
        const Icon = ACTION_ICONS[event.action] || FiAlertCircle;
        const colorClass =
          ACTION_COLORS[event.action] || "text-slate-400 bg-white/10";

        return (
          <div
            key={event.id || index}
            className="relative flex gap-3 py-2.5"
          >
            {/* Icon node */}
            <div
              className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm text-slate-200">
                {event.message || event.label || event.action}
              </p>
              <div className="mt-1 flex items-center gap-2">
                {event.created_by_name || event.user_name ? (
                  <div className="flex items-center gap-1.5">
                    <SigmaAvatar
                      name={event.created_by_name || event.user_name}
                      size="xs"
                    />
                    <span className="text-xs text-slate-400">
                      {event.created_by_name || event.user_name}
                    </span>
                  </div>
                ) : null}
                <span className="text-xs text-slate-500">
                  {formatTimestamp(event.created_at)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SigmaTimeline;
