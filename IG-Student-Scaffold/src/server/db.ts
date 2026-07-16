import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Initialize Vault Database & Folders
const dataDir = process.env.DATA_DIR || process.cwd();
export const vaultDb = new Database(path.join(dataDir, "vault.db"));

export function initDb() {
  vaultDb.exec(`
    CREATE TABLE IF NOT EXISTS vault_folders (
      id TEXT PRIMARY KEY,
      teacherCode TEXT NOT NULL,
      parent_id TEXT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(teacherCode, parent_id, name)
    );

    CREATE TABLE IF NOT EXISTS vault_scaffolds (
      id TEXT PRIMARY KEY,
      teacherCode TEXT NOT NULL,
      folder_id TEXT NOT NULL,
      title TEXT NOT NULL,
      paperType TEXT,
      targetMarks TEXT,
      framework TEXT,
      question TEXT,
      scaffold_text TEXT,
      frame_text TEXT,
      tags TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

// ---------------------------
// Folders CRUD
// ---------------------------

export function getFolders(teacherCode: string) {
  const stmt = vaultDb.prepare("SELECT * FROM vault_folders WHERE teacherCode = ? ORDER BY name ASC");
  return stmt.all(teacherCode);
}

export function createFolder(id: string, teacherCode: string, name: string, parentId: string | null) {
  try {
    const stmt = vaultDb.prepare(
      "INSERT INTO vault_folders (id, teacherCode, parent_id, name, created_at) VALUES (?, ?, ?, ?, ?)"
    );
    const createdAt = new Date().toISOString();
    stmt.run(id, teacherCode, parentId, name, createdAt);
    return { id, teacherCode, parentId, name, created_at: createdAt };
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      throw new Error("A folder with this name already exists in this location.");
    }
    throw error;
  }
}

export function deleteFolder(id: string, teacherCode: string) {
  // We need to delete recursively or prevent deletion if not empty.
  // Let's implement cascade delete manually for now.
  const deleteScaffolds = vaultDb.prepare("DELETE FROM vault_scaffolds WHERE folder_id = ? AND teacherCode = ?");
  deleteScaffolds.run(id, teacherCode);

  const deleteFolderStmt = vaultDb.prepare("DELETE FROM vault_folders WHERE id = ? AND teacherCode = ?");
  const result = deleteFolderStmt.run(id, teacherCode);

  return result.changes > 0;
}

// ---------------------------
// Scaffolds CRUD
// ---------------------------

export function getScaffolds(teacherCode: string) {
  const stmt = vaultDb.prepare("SELECT * FROM vault_scaffolds WHERE teacherCode = ? ORDER BY created_at DESC");
  return stmt.all(teacherCode);
}

export function saveScaffold(
  id: string,
  teacherCode: string,
  folder_id: string,
  title: string,
  paperType: string,
  targetMarks: string,
  framework: string,
  question: string,
  scaffold_text: string,
  frame_text: string,
  tags: string
) {
  const stmt = vaultDb.prepare(`
    INSERT INTO vault_scaffolds (
      id, teacherCode, folder_id, title, paperType, targetMarks, framework, question, scaffold_text, frame_text, tags, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const createdAt = new Date().toISOString();
  stmt.run(
    id, teacherCode, folder_id, title, paperType, targetMarks, framework, question, scaffold_text, frame_text, tags, createdAt
  );
  return { id, title, folder_id, created_at: createdAt };
}

export function deleteScaffold(id: string, teacherCode: string) {
  const stmt = vaultDb.prepare("DELETE FROM vault_scaffolds WHERE id = ? AND teacherCode = ?");
  const result = stmt.run(id, teacherCode);
  return result.changes > 0;
}
