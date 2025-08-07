import React from "react";

export interface Problem {
  message: string;
  line: number;
  column: number;
  severity: "error" | "warning";
  source?: string;
}

interface ProblemsPanelProps {
  problems: Problem[];
  onGoToLine?: (line: number) => void;
}

export default function ProblemsPanel({ problems, onGoToLine }: ProblemsPanelProps) {
  if (!problems.length) {
    return (
      <div className="p-4 text-xs text-slate-400">No problems found in this file.</div>
    );
  }
  return (
    <div className="p-2 text-xs bg-slate-900 border-t border-slate-700 max-h-48 overflow-auto">
      <div className="font-bold mb-2">Problems</div>
      <ul>
        {problems.map((p, i) => (
          <li
            key={i}
            className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-slate-800 ${p.severity === "error" ? "text-red-400" : "text-yellow-300"}`}
            onClick={() => onGoToLine?.(p.line)}
          >
            <span className="w-12 font-mono">{p.severity.toUpperCase()}</span>
            <span className="w-16">Line {p.line}</span>
            <span className="flex-1">{p.message}</span>
            {p.source && <span className="ml-2 text-slate-500">[{p.source}]</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
