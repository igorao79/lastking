"use client";

export default function StreamingView({
  text,
  chapterNumber,
}: {
  text: string;
  chapterNumber: number;
}) {
  const cleanText = text.split("---SUMMARY---")[0];

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-3 h-3 rounded-full bg-gold animate-pulse-gold" />
        <span className="text-gold text-sm tracking-wide">
          Генерируется Глава {chapterNumber}...
        </span>
      </div>

      <div className="bg-bg-card rounded-xl border border-gold/20 p-6 sm:p-10 animate-pulse-gold">
        <div className="chapter-content text-text-primary text-base sm:text-lg leading-relaxed">
          {cleanText
            .split("\n\n")
            .filter((p) => p.trim())
            .map((paragraph, i) => (
              <p key={i}>{paragraph.trim()}</p>
            ))}
          <span className="inline-block w-0.5 h-5 bg-gold animate-typewriter ml-0.5" />
        </div>
      </div>
    </div>
  );
}
