import { createClient, type Client } from "@libsql/client";

let _db: Client | null = null;

function getDB(): Client {
  if (!_db) {
    _db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
  }
  return _db;
}

export async function initDB() {
  await getDB().execute(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_number INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await getDB().execute(`
    CREATE TABLE IF NOT EXISTS book_meta (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      title TEXT NOT NULL DEFAULT 'Последний король',
      description TEXT NOT NULL DEFAULT 'История о внеземной цивилизации, её развитии и трудностях',
      total_chapters INTEGER NOT NULL DEFAULT 0,
      is_generating INTEGER NOT NULL DEFAULT 0
    )
  `);

  const meta = await getDB().execute("SELECT * FROM book_meta WHERE id = 1");
  if (meta.rows.length === 0) {
    await getDB().execute(
      "INSERT INTO book_meta (id, title, description, total_chapters, is_generating) VALUES (1, 'Последний король', 'История о внеземной цивилизации, её развитии и трудностях', 0, 0)"
    );
  }
}

export async function getChapters() {
  await initDB();
  const result = await getDB().execute(
    "SELECT * FROM chapters ORDER BY chapter_number ASC"
  );
  return result.rows;
}

export async function getChapter(chapterNumber: number) {
  await initDB();
  const result = await getDB().execute({
    sql: "SELECT * FROM chapters WHERE chapter_number = ?",
    args: [chapterNumber],
  });
  return result.rows[0] || null;
}

export async function getLastChapter() {
  await initDB();
  const result = await getDB().execute(
    "SELECT * FROM chapters ORDER BY chapter_number DESC LIMIT 1"
  );
  return result.rows[0] || null;
}

export async function getChapterSummaries() {
  await initDB();
  const result = await getDB().execute(
    "SELECT chapter_number, title, summary FROM chapters ORDER BY chapter_number ASC"
  );
  return result.rows;
}

export async function saveChapter(
  chapterNumber: number,
  title: string,
  content: string,
  summary: string
) {
  await initDB();
  await getDB().execute({
    sql: "INSERT INTO chapters (chapter_number, title, content, summary) VALUES (?, ?, ?, ?)",
    args: [chapterNumber, title, content, summary],
  });
  await getDB().execute({
    sql: "UPDATE book_meta SET total_chapters = ? WHERE id = 1",
    args: [chapterNumber],
  });
}

export async function getBookMeta() {
  await initDB();
  const result = await getDB().execute("SELECT * FROM book_meta WHERE id = 1");
  return result.rows[0] || null;
}

export async function setGenerating(isGenerating: boolean) {
  await initDB();
  await getDB().execute({
    sql: "UPDATE book_meta SET is_generating = ? WHERE id = 1",
    args: [isGenerating ? 1 : 0],
  });
}

export default getDB;
