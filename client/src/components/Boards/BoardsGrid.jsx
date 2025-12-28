import React, { useMemo, useState } from "react";
import BoardCard from "./BoardCard";

export default function BoardsGrid({ boards }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return boards;
    return boards.filter((b) => b.status === filter);
  }, [boards, filter]);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Your Boards</h2>
          <p className="text-sm text-slate-600">
            Dynamic render from an array of objects (no static markup).
          </p>
        </div>

        <div className="flex gap-2">
          {["all", "active", "archived"].map((v) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={[
                "px-3 py-2 rounded-full text-sm border transition",
                filter === v
                  ? "bg-white border-slate-300 shadow-soft"
                  : "border-slate-200 hover:bg-white"
              ].join(" ")}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
      </div>
    </section>
  );
}
