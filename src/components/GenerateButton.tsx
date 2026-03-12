"use client";

export default function GenerateButton({
  isGenerating,
  onGenerate,
}: {
  isGenerating: boolean;
  onGenerate: () => void;
}) {
  return (
    <button
      onClick={onGenerate}
      disabled={isGenerating}
      className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 ${
        isGenerating
          ? "bg-gold/20 text-gold/50 cursor-not-allowed border border-gold/10"
          : "bg-gradient-to-r from-gold-dark via-gold to-gold-dark text-bg-dark hover:shadow-lg hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98]"
      }`}
    >
      {isGenerating ? (
        <span className="flex items-center justify-center gap-3">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Пишется новая глава...
        </span>
      ) : (
        "Написать следующую главу"
      )}
    </button>
  );
}
