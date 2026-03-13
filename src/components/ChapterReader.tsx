"use client";

interface Chapter {
  id: number;
  chapter_number: number;
  title: string;
  content: string;
  summary: string;
  created_at: string;
}

function formatContent(content: string) {
  return content
    .split("\n\n")
    .filter((p) => p.trim())
    .map((paragraph, i) => (
      <p key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.03}s` }}>
        {paragraph.trim()}
      </p>
    ));
}

export default function ChapterReader({ chapter }: { chapter: Chapter }) {
  return (
    <article className="animate-fade-in-up">
      <header className="mb-10 pb-8 border-b border-gold/10">
        <span className="text-gold/50 text-sm tracking-[0.2em] uppercase">
          Глава {chapter.chapter_number}
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold text-gold mt-2 text-balance">
          {chapter.title}
        </h2>
        <time className="text-text-secondary/50 text-sm mt-3 block">
          {new Date(chapter.created_at + "Z").toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </header>

      <div className="chapter-content text-text-primary text-base sm:text-lg leading-relaxed max-w-none">
        {formatContent(chapter.content)}
      </div>

      <footer className="mt-12 pt-8 border-t border-gold/10">
        <div className="bg-bg-card rounded-xl p-6 border border-white/5">
          <h4 className="text-gold/70 text-xs tracking-[0.2em] uppercase mb-3">
            Краткое содержание
          </h4>
          <p className="text-text-secondary text-sm leading-relaxed">
            {chapter.summary}
          </p>
        </div>
      </footer>
    </article>
  );
}
