"use client";

interface Chapter {
  id: number;
  chapter_number: number;
  title: string;
  content: string;
  summary: string;
  created_at: string;
}

export default function ChapterList({
  chapters,
  selectedChapter,
  onSelect,
}: {
  chapters: Chapter[];
  selectedChapter: number | null;
  onSelect: (num: number) => void;
}) {
  if (chapters.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        <div className="text-5xl mb-4 opacity-30">&#9733;</div>
        <p className="text-lg">Главы ещё не написаны</p>
        <p className="text-sm mt-2">
          Первая глава будет создана автоматически
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter) => {
        const isSelected = selectedChapter === chapter.chapter_number;
        return (
          <button
            key={chapter.id}
            onClick={() => onSelect(Number(chapter.chapter_number))}
            className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-300 group ${
              isSelected
                ? "bg-gold/10 border-gold/40 shadow-lg shadow-gold/5"
                : "bg-bg-card border-white/5 hover:bg-bg-card-hover hover:border-gold/20"
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <span
                className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  isSelected
                    ? "bg-gold text-bg-dark"
                    : "bg-white/5 text-gold/70 group-hover:bg-gold/20"
                }`}
              >
                {chapter.chapter_number}
              </span>
              <div className="min-w-0 flex-1">
                <h3
                  className={`font-bold text-sm sm:text-base truncate ${
                    isSelected ? "text-gold" : "text-text-primary"
                  }`}
                >
                  {chapter.title}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm mt-1 line-clamp-2">
                  {chapter.summary}
                </p>
                <span className="text-xs text-text-secondary/50 mt-2 block">
                  {new Date(chapter.created_at + "Z").toLocaleDateString(
                    "ru-RU",
                    {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
