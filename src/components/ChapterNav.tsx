"use client";

import { useState, useMemo } from "react";

interface Chapter {
  id: number;
  chapter_number: number;
  title: string;
  summary: string;
}

const CHAPTERS_PER_PAGE = 50;

export default function ChapterNav({
  chapters,
  selectedChapter,
  onSelect,
}: {
  chapters: Chapter[];
  selectedChapter: number | null;
  onSelect: (num: number) => void;
}) {
  const totalPages = Math.ceil(chapters.length / CHAPTERS_PER_PAGE);
  const needsPagination = chapters.length > CHAPTERS_PER_PAGE;

  // Find which page the selected chapter is on
  const selectedIdx = chapters.findIndex(
    (c) => Number(c.chapter_number) === selectedChapter
  );
  const initialPage = selectedIdx >= 0 ? Math.floor(selectedIdx / CHAPTERS_PER_PAGE) : totalPages - 1;

  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");

  const filteredChapters = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return chapters.filter(
      (c) =>
        String(c.chapter_number).includes(q) ||
        c.title.toLowerCase().includes(q)
    );
  }, [chapters, search]);

  const displayChapters = filteredChapters
    ? filteredChapters
    : chapters.slice(page * CHAPTERS_PER_PAGE, (page + 1) * CHAPTERS_PER_PAGE);

  return (
    <div className="flex flex-col gap-2">
      {/* Search - show when many chapters */}
      {needsPagination && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск главы..."
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-gold/30 mb-1"
        />
      )}

      {/* Chapter list */}
      <nav className="space-y-0.5">
        {displayChapters.map((chapter) => {
          const isSelected = selectedChapter === Number(chapter.chapter_number);
          return (
            <button
              key={chapter.id}
              onClick={() => onSelect(Number(chapter.chapter_number))}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isSelected
                  ? "bg-gold/10 border-l-2 border-gold"
                  : "hover:bg-white/5 border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? "bg-gold text-bg-dark"
                      : "bg-white/5 text-text-secondary group-hover:text-gold/70"
                  }`}
                >
                  {chapter.chapter_number}
                </span>
                <span
                  className={`text-sm truncate ${
                    isSelected
                      ? "text-gold font-semibold"
                      : "text-text-secondary group-hover:text-text-primary"
                  }`}
                >
                  {chapter.title}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Pagination controls */}
      {needsPagination && !filteredChapters && (
        <div className="flex items-center justify-between px-2 pt-2 border-t border-white/5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-xs text-text-secondary hover:text-gold disabled:opacity-30 disabled:hover:text-text-secondary transition-colors"
          >
            &larr; Назад
          </button>
          <span className="text-xs text-text-secondary/50">
            {page * CHAPTERS_PER_PAGE + 1}&ndash;
            {Math.min((page + 1) * CHAPTERS_PER_PAGE, chapters.length)} из{" "}
            {chapters.length}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="text-xs text-text-secondary hover:text-gold disabled:opacity-30 disabled:hover:text-text-secondary transition-colors"
          >
            Вперёд &rarr;
          </button>
        </div>
      )}

      {/* Search results info */}
      {filteredChapters && (
        <p className="text-xs text-text-secondary/50 px-2">
          Найдено: {filteredChapters.length}
        </p>
      )}
    </div>
  );
}
