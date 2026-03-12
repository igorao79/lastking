import Groq from "groq-sdk";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY! });
}

interface ChapterContext {
  chapterNumber: number;
  previousChapterSummary?: string;
  allSummaries?: { chapter_number: number; title: string; summary: string }[];
}

const BOOK_PREMISE = `Ты — талантливый писатель-фантаст, пишущий эпический роман "Последний король" на русском языке.

СЮЖЕТ: Это история о внеземной цивилизации на далёкой планете Элирион. Цивилизация Зар'кхай — древняя и мудрая раса, которая развивалась тысячелетиями. У них есть король — последний правитель, на чьи плечи ложится судьба всей расы.

ТЕМЫ:
- Развитие цивилизации от примитивных форм к космической расе
- Политические интриги и борьба за власть
- Научные открытия и технологические прорывы
- Войны и конфликты с другими расами или внутренние
- Философские вопросы о смысле существования цивилизации
- Экологические катастрофы и адаптация
- Культура, религия и традиции инопланетной расы
- Последний король, который должен провести свой народ через величайший кризис

СТИЛЬ: Эпический, кинематографичный, с глубокими персонажами и захватывающим сюжетом. Пиши на русском языке, используй красивый литературный язык.`;

export async function generateChapter(context: ChapterContext): Promise<{
  title: string;
  content: string;
  summary: string;
}> {
  let contextPrompt = "";

  if (context.allSummaries && context.allSummaries.length > 0) {
    contextPrompt += "\n\nКРАТКОЕ СОДЕРЖАНИЕ ПРЕДЫДУЩИХ ГЛАВ:\n";
    for (const s of context.allSummaries) {
      contextPrompt += `Глава ${s.chapter_number} "${s.title}": ${s.summary}\n`;
    }
  }

  if (context.previousChapterSummary) {
    contextPrompt += `\nПОДРОБНОЕ СОДЕРЖАНИЕ ПОСЛЕДНЕЙ ГЛАВЫ:\n${context.previousChapterSummary}\n`;
  }

  const chapterPrompt = `${BOOK_PREMISE}${contextPrompt}

Напиши Главу ${context.chapterNumber} романа "Последний король".

ТРЕБОВАНИЯ:
- Глава должна быть от 1500 до 2500 слов
- Начни с заголовка главы в формате: # Название главы
- Глава должна логически продолжать предыдущие события${context.chapterNumber === 1 ? " (это первая глава — начни историю)" : ""}
- Включи диалоги, описания, действия
- Заканчивай главу интригующе, чтобы читатель хотел продолжения
- Развивай персонажей и мир
- Пиши ТОЛЬКО текст главы, без метаданных

После текста главы, на новой строке напиши:
---SUMMARY---
И дай краткое содержание этой главы в 3-5 предложениях для контекста следующих глав.`;

  const completion = await getGroq().chat.completions.create({
    messages: [
      {
        role: "system",
        content: BOOK_PREMISE,
      },
      {
        role: "user",
        content: chapterPrompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.85,
    max_tokens: 8000,
    top_p: 0.9,
  });

  const fullText = completion.choices[0]?.message?.content || "";

  const parts = fullText.split("---SUMMARY---");
  const chapterText = parts[0].trim();
  const summary = parts[1]?.trim() || "Краткое содержание недоступно.";

  let title = `Глава ${context.chapterNumber}`;
  const titleMatch = chapterText.match(/^#\s*(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  const content = chapterText.replace(/^#\s*.+$/m, "").trim();

  return { title, content, summary };
}

export async function* streamChapter(context: ChapterContext) {
  let contextPrompt = "";

  if (context.allSummaries && context.allSummaries.length > 0) {
    contextPrompt += "\n\nКРАТКОЕ СОДЕРЖАНИЕ ПРЕДЫДУЩИХ ГЛАВ:\n";
    for (const s of context.allSummaries) {
      contextPrompt += `Глава ${s.chapter_number} "${s.title}": ${s.summary}\n`;
    }
  }

  if (context.previousChapterSummary) {
    contextPrompt += `\nПОДРОБНОЕ СОДЕРЖАНИЕ ПОСЛЕДНЕЙ ГЛАВЫ:\n${context.previousChapterSummary}\n`;
  }

  const chapterPrompt = `${BOOK_PREMISE}${contextPrompt}

Напиши Главу ${context.chapterNumber} романа "Последний король".

ТРЕБОВАНИЯ:
- Глава должна быть от 1500 до 2500 слов
- Начни с заголовка главы в формате: # Название главы
- Глава должна логически продолжать предыдущие события${context.chapterNumber === 1 ? " (это первая глава — начни историю)" : ""}
- Включи диалоги, описания, действия
- Заканчивай главу интригующе, чтобы читатель хотел продолжения
- Развивай персонажей и мир
- Пиши ТОЛЬКО текст главы, без метаданных

После текста главы, на новой строке напиши:
---SUMMARY---
И дай краткое содержание этой главы в 3-5 предложениях для контекста следующих глав.`;

  const stream = await getGroq().chat.completions.create({
    messages: [
      {
        role: "system",
        content: BOOK_PREMISE,
      },
      {
        role: "user",
        content: chapterPrompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.85,
    max_tokens: 8000,
    top_p: 0.9,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      yield content;
    }
  }
}
