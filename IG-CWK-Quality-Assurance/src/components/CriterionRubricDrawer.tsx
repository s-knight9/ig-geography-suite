import React from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { IGQA_CRITERION_RUBRICS } from '../data/igqaCriterionRubrics';

interface CriterionRubricDrawerProps {
  criterionNumber: number;
  isOpen: boolean;
  onToggle: () => void;
  hideInPrint?: boolean;
}

const CELL_BORDER = '1px solid #1E293B';

export function CriterionRubricTable({ criterionNumber }: { criterionNumber: number }) {
  const rubric = IGQA_CRITERION_RUBRICS[criterionNumber];
  if (!rubric) return null;

  return (
    <table
      data-rubric-table={criterionNumber}
      className="igqa-rubric-table w-full"
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        border: CELL_BORDER,
        fontSize: '12.5px',
        lineHeight: 1.45,
        color: '#0F172A',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <thead>
        <tr>
          <th
            colSpan={3}
            style={{
              border: CELL_BORDER,
              backgroundColor: '#F1F5F9',
              color: '#0F172A',
              padding: '6px 10px',
              textAlign: 'center',
              fontWeight: 700,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {rubric.fullTitle}
          </th>
        </tr>
        <tr style={{ backgroundColor: '#F8FAFC', color: '#0F172A' }}>
          <th
            style={{
              border: CELL_BORDER,
              padding: '5px 8px',
              textAlign: 'center',
              fontWeight: 700,
              width: '64px',
              backgroundColor: '#F8FAFC',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            Level
          </th>
          <th
            style={{
              border: CELL_BORDER,
              padding: '5px 8px',
              textAlign: 'left',
              fontWeight: 700,
              backgroundColor: '#F8FAFC',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            Description
          </th>
          <th
            style={{
              border: CELL_BORDER,
              padding: '5px 8px',
              textAlign: 'center',
              fontWeight: 700,
              width: '80px',
              backgroundColor: '#F8FAFC',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            Marks
          </th>
        </tr>
      </thead>
      <tbody>
        {rubric.bands.map((band) =>
          band.bullets.map((bullet, idx) => (
            <tr
              key={`${band.level}-${idx}`}
              style={{
                backgroundColor: band.bgColor,
                color: '#0F172A',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              {idx === 0 && (
                <td
                  rowSpan={band.bullets.length}
                  style={{
                    border: CELL_BORDER,
                    padding: '6px 8px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    fontWeight: 700,
                    backgroundColor: band.bgColor,
                    color: '#0F172A',
                    width: '64px',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  {band.level}
                </td>
              )}
              <td
                style={{
                  border: CELL_BORDER,
                  padding: '5px 8px',
                  textAlign: 'left',
                  verticalAlign: 'middle',
                  backgroundColor: band.bgColor,
                  color: '#0F172A',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                {bullet}
              </td>
              {idx === 0 && (
                <td
                  rowSpan={band.bullets.length}
                  style={{
                    border: CELL_BORDER,
                    padding: '6px 8px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    fontWeight: 600,
                    backgroundColor: band.bgColor,
                    color: '#0F172A',
                    width: '80px',
                    whiteSpace: 'nowrap',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  {band.marks}
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export function CriterionRubricDrawer({
  criterionNumber,
  isOpen,
  onToggle,
  hideInPrint = false,
}: CriterionRubricDrawerProps) {
  const rubric = IGQA_CRITERION_RUBRICS[criterionNumber];
  if (!rubric) return null;

  return (
    <div className={`mt-2 ${hideInPrint ? 'print:hidden' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="print:hidden w-full flex items-center justify-between gap-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
            Official Mark Scheme Rubric (RAG Reference)
          </span>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
            title="RAG Mark Bands (Green: L3, Amber: L2, Red: L1/L0)"
          >
            <span
              className="w-2 h-2 rounded-full border border-slate-400/50"
              style={{ backgroundColor: '#D9EAD3' }}
            />
            <span
              className="w-2 h-2 rounded-full border border-slate-400/50"
              style={{ backgroundColor: '#FFE599' }}
            />
            <span
              className="w-2 h-2 rounded-full border border-slate-400/50"
              style={{ backgroundColor: '#EA9999' }}
            />
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
          <span>{isOpen ? 'Hide' : 'Show'}</span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </span>
      </button>

      <div
        className={`${
          isOpen ? 'block mt-2' : 'hidden'
        } print:block print:mt-0 overflow-x-auto print:overflow-visible`}
      >
        <CriterionRubricTable criterionNumber={criterionNumber} />
      </div>
    </div>
  );
}
