import React from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiArrowLeft } from "react-icons/fi";

const Breadcrumb = ({ items = [], showBackButton = false }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {showBackButton ? (
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
        >
          <FiArrowLeft className="text-base" />
          Back to Dashboard
        </button>
      ) : (
        <nav className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            Dashboard
          </button>
          {items.map((item, index) => (
            <React.Fragment key={item.id || index}>
              <FiChevronRight className="text-slate-600" />
              <span className="text-sm font-medium text-slate-200">{item.label}</span>
            </React.Fragment>
          ))}
        </nav>
      )}
    </div>
  );
};

export default Breadcrumb;
