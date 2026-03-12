"use client";

export default function Header({ totalChapters }: { totalChapters: number }) {
  return (
    <header className="relative overflow-hidden border-b border-gold/20">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
      <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="mb-4 text-gold/60 text-sm tracking-[0.3em] uppercase">
          Самогенерирующийся роман
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gold mb-4 tracking-tight">
          Последний король
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
        <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          История о внеземной цивилизации Зар&apos;кхай на далёкой планете
          Элирион — об их развитии, трудностях и последнем короле, на чьи плечи
          легла судьба всей расы
        </p>
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-text-secondary">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold/60" />
            {totalChapters}{" "}
            {totalChapters === 1
              ? "глава"
              : totalChapters < 5
                ? "главы"
                : "глав"}{" "}
            написано
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500/60 animate-pulse" />
            Новая глава каждые 30 мин
          </span>
        </div>
      </div>
    </header>
  );
}
