import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import SigmaBadge from "./SigmaBadge";
import SigmaAvatar from "./SigmaAvatar";
import { pretty } from "./StatusBadge";

const SigmaKanbanBoard = ({
  columns = [],
  cards = [],
  onCardMove,
  onCardClick,
  getCardStatus,
  renderCard,
  className = "",
}) => {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const getCardsForColumn = useCallback(
    (columnId) => cards.filter((card) => getCardStatus(card) === columnId),
    [cards, getCardStatus]
  );

  const handleDragStart = (e, card) => {
    setDragging(card);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(columnId);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    setDragOver(null);
    if (dragging && getCardStatus(dragging) !== targetColumn) {
      onCardMove?.(dragging, targetColumn);
    }
    setDragging(null);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  const DefaultCard = ({ card }) => (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-white truncate">
          {card.full_name || card.name || card.title}
        </p>
        {card.priority_level && (
          <SigmaBadge value={card.priority_level} variant="dot" />
        )}
      </div>
      {(card.mobile_number || card.lead_id) && (
        <p className="text-xs text-slate-400 truncate">
          {card.lead_id || card.mobile_number}
        </p>
      )}
      <div className="flex items-center justify-between">
        {card.lead_source && (
          <SigmaBadge value={card.lead_source} />
        )}
        {(card.assigned_executive_name || card.full_name) && (
          <SigmaAvatar
            name={card.assigned_executive_name || ""}
            size="xs"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
      {columns.map((column) => {
        const columnCards = getCardsForColumn(column.id);
        const isOver = dragOver === column.id;

        return (
          <div
            key={column.id}
            className="flex w-72 flex-shrink-0 flex-col rounded-xl"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  {column.label || pretty(column.id)}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-400">
                  {columnCards.length}
                </span>
              </div>
            </div>

            {/* Cards container */}
            <div
              className={`flex-1 space-y-2 rounded-xl border p-2 transition-colors
                ${isOver
                  ? "border-[var(--sigma-accent)]/40 bg-[var(--sigma-accent)]/5"
                  : "border-[var(--sigma-border)] bg-[var(--sigma-surface)]/40"
                }
                ${columnCards.length === 0 ? "min-h-[100px] border-dashed" : ""}`}
            >
              {columnCards.map((card) => {
                const isDraggingThis = dragging && (card.id === dragging.id);

                return (
                  <motion.div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onCardClick?.(card)}
                    layout
                    className={`cursor-grab rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)] p-3 transition-shadow
                      hover:border-slate-600 hover:shadow-lg active:cursor-grabbing
                      ${isDraggingThis ? "opacity-50 scale-[1.02] shadow-xl" : ""}`}
                  >
                    {renderCard ? renderCard(card) : <DefaultCard card={card} />}
                  </motion.div>
                );
              })}

              {columnCards.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-500">
                  Drop here
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SigmaKanbanBoard;
