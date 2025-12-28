import React from "react";

export default function BoardCard({ board }) {
  const statusBadge =
    board.status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight truncate">{board.title}</h3>
          <p className="text-sm text-slate-600 mt-1">{board.description}</p>
        </div>

        <span className={`text-xs px-2 py-1 rounded-full border ${statusBadge}`}>
          {board.status}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="px-2 py-1 rounded-full bg-[#fbfaf7] border border-slate-200">
          {board.tag}
        </span>
        <span>Created: {board.createdAt}</span>
      </div>
    </article>
  );
}
