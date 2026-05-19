import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import SigmaButton from "./SigmaButton";

const SigmaErrorCard = ({
  title = "Something went wrong",
  message = "An error occurred while loading data. Please try again.",
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center ${className}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
        <FiAlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-slate-400">{message}</p>
      {onRetry && (
        <SigmaButton variant="secondary" size="sm" onClick={onRetry} className="mt-4">
          <FiRefreshCw className="h-3.5 w-3.5" />
          Retry
        </SigmaButton>
      )}
    </div>
  );
};

export default SigmaErrorCard;
