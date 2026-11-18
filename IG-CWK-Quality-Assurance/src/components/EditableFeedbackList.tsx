import React from 'react';
import { CheckCircle2, AlertCircle, Plus, Trash2, Edit2, MapPin } from 'lucide-react';
import {
  CwkFeedbackItem,
  RAG_STYLES,
  getDefaultRagColor,
  normalizeFeedbackItems,
} from '../utils/ragStyles';

interface EditableFeedbackListProps {
  items: (CwkFeedbackItem | string)[];
  criterionId: string; // "1", "2", etc.
  criterionScore?: number;
  type: 'WWW' | 'EBI';
  isEditable: boolean;
  onChange?: (newItems: CwkFeedbackItem[]) => void;
  onJumpToItem?: (item: CwkFeedbackItem) => void;
}

export function EditableFeedbackList({
  items,
  criterionId,
  criterionScore = 0,
  type,
  isEditable,
  onChange,
  onJumpToItem,
}: EditableFeedbackListProps) {
  const criterionNumber = Number(criterionId) || 1;
  const sectionLetter = type === 'WWW' ? 'A' : 'B';
  const title = type === 'WWW' ? 'A) What Went Well (WWW)' : 'B) Even Better If (EBI)';
  const Icon = type === 'WWW' ? CheckCircle2 : AlertCircle;

  const normalizedItems = normalizeFeedbackItems(items, criterionNumber, type, criterionScore);

  const commit = (next: CwkFeedbackItem[]) => {
    if (!onChange) return;
    onChange(next.map((item, idx) => ({
      ...item,
      code: `${criterionNumber}.${idx + 1}${sectionLetter}`,
    })));
  };

  const handleEditText = (idx: number, newVal: string) => {
    const copy = normalizedItems.map((it, i) =>
      i === idx ? { ...it, text: newVal } : it
    );
    commit(copy);
  };

  const handleToggleChecked = (idx: number) => {
    const target = normalizedItems[idx];
    if (!target) return;
    const nextChecked = !target.isChecked;
    const updatedItem: CwkFeedbackItem = { ...target, isChecked: nextChecked };
    const copy = normalizedItems.map((it, i) => (i === idx ? updatedItem : it));
    commit(copy);

    if (nextChecked && onJumpToItem) {
      onJumpToItem(updatedItem);
    }
  };

  const handleBadgeClick = (idx: number) => {
    const target = normalizedItems[idx];
    if (!target) return;

    if (type === 'WWW') {
      const nextColor = target.ragColor === 'green' ? 'amber' : 'green';
      const updatedItem: CwkFeedbackItem = { ...target, ragColor: nextColor };
      const copy = normalizedItems.map((it, i) => (i === idx ? updatedItem : it));
      commit(copy);
      if (updatedItem.isChecked && onJumpToItem) {
        onJumpToItem(updatedItem);
      }
    } else if (target.isChecked && onJumpToItem) {
      onJumpToItem(target);
    }
  };

  const handleRemove = (idx: number) => {
    const copy = [...normalizedItems];
    copy.splice(idx, 1);
    commit(copy);
  };

  const handleAdd = () => {
    const nextIdx = normalizedItems.length + 1;
    const newItem: CwkFeedbackItem = {
      id: `c${criterionNumber}-${type.toLowerCase()}-${Date.now()}-${nextIdx}`,
      code: `${criterionNumber}.${nextIdx}${sectionLetter}`,
      type,
      text: '',
      ragColor: getDefaultRagColor(type, criterionScore),
      isChecked: true,
      pdfLocation: {
        page: criterionNumber,
        xPercent: 2.5,
        yPercent: Math.min(92, (type === 'WWW' ? 14 : 54) + ((nextIdx * 10) % 36)),
        anchorQuote: '',
        anchorRationale: '',
      },
    };
    commit([...normalizedItems, newItem]);
  };

  return (
    <div className="bg-slate-50/80 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700/70 group">
      <div className="flex items-center justify-between mb-3">
        <h5
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
            type === 'WWW'
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-rose-700 dark:text-rose-400'
          }`}
        >
          <Icon className="w-4 h-4" />
          {title}
          {isEditable && (
            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity print:hidden" />
          )}
        </h5>
        {type === 'WWW' && (
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 print:hidden">
            Click A-badge to toggle Green/Amber
          </span>
        )}
      </div>

      <ul className="space-y-2.5">
        {normalizedItems.map((item, i) => {
          const style = RAG_STYLES[item.ragColor] || RAG_STYLES.amber;

          return (
            <li
              key={item.id}
              data-feedback-item={item.code}
              data-rag-color={item.ragColor}
              onClick={() => {
                if (item.isChecked && onJumpToItem) {
                  onJumpToItem(item);
                }
              }}
              style={{
                backgroundColor: style.cardBg,
                border: `1px solid ${style.cardBorder}`,
                borderLeft: `4px solid ${style.cardAccentBorder}`,
                opacity: item.isChecked ? 1 : 0.65,
              }}
              className={`rounded-lg p-2.5 transition-all ${
                item.isChecked
                  ? 'cursor-pointer hover:shadow-sm'
                  : 'print:hidden'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Far-left Interactive Tick Box */}
                <input
                  type="checkbox"
                  checked={item.isChecked}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleToggleChecked(i)}
                  aria-label={`Include ${item.code} margin reference`}
                  title={
                    item.isChecked
                      ? 'Checked: badge active on PDF margin and report (click to hide)'
                      : 'Unchecked: badge hidden from PDF margin (click to restore & jump)'
                  }
                  className="mt-1.5 w-4 h-4 rounded border-slate-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0 print:hidden"
                />

                {/* RAG Color Pill Badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBadgeClick(i);
                  }}
                  title={
                    type === 'WWW'
                      ? `Click to toggle Green/Amber band (${style.label})`
                      : `Click to jump to ${item.code} on page ${item.pdfLocation.page}`
                  }
                  style={{
                    backgroundColor: style.badgeBg,
                    border: `1.5px solid ${style.badgeBorder}`,
                    color: style.badgeText,
                  }}
                  className="text-[11px] font-black tracking-wide px-2 py-0.5 rounded-md shrink-0 mt-0.5 cursor-pointer hover:brightness-95 transition-all select-none"
                >
                  {item.code}
                </button>

                {/* Feedback Text Content */}
                {isEditable ? (
                  <div className="flex-1 flex items-start gap-1.5 group/item min-w-0">
                    <textarea
                      value={item.text}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.isChecked && onJumpToItem) {
                          onJumpToItem(item);
                        }
                      }}
                      onChange={(e) => handleEditText(i, e.target.value)}
                      className="flex-1 w-full bg-white/85 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[38px]"
                      rows={Math.max(1, Math.ceil(item.text.length / 72))}
                    />

                    {item.isChecked && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onJumpToItem) onJumpToItem(item);
                        }}
                        title={
                          item.pdfLocation.anchorQuote
                            ? `Anchored to: "${item.pdfLocation.anchorQuote}" on page ${item.pdfLocation.page}`
                            : `Jump to Page ${item.pdfLocation.page}`
                        }
                        className="mt-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/90 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 shrink-0 cursor-pointer print:hidden"
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        <span>p.{item.pdfLocation.page}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(i);
                      }}
                      title="Remove comment"
                      className="mt-1 text-slate-400 hover:text-red-500 hover:bg-white/70 dark:hover:bg-slate-800 p-1 rounded-md opacity-0 group-hover/item:opacity-100 transition-all shrink-0 cursor-pointer print:hidden"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span
                    className="flex-1 text-sm leading-relaxed pt-0.5 font-medium"
                    style={{ color: '#0F172A' }}
                  >
                    {item.text}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {isEditable && (
        <button
          type="button"
          onClick={handleAdd}
          className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white uppercase tracking-widest hover:bg-slate-200/70 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer print:hidden"
        >
          <Plus className="w-3 h-3" /> Add Teacher Comment
        </button>
      )}
    </div>
  );
}
