export interface VaultFolder {
  id: string;
  teacherCode: string;
  parent_id: string | null;
  name: string;
  created_at: string;
}

export interface VaultScaffold {
  id: string;
  teacherCode: string;
  folder_id: string;
  title: string;
  paperType: string;
  targetMarks: string;
  framework: string;
  question: string;
  scaffold_text: string;
  frame_text: string;
  tags: string;
  created_at: string;
}

export async function fetchFolders(teacherCode: string): Promise<VaultFolder[]> {
  const res = await fetch(`/api/vault/folders?teacherCode=${teacherCode}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.folders;
}

export async function createFolder(teacherCode: string, name: string, parentId: string | null = null): Promise<VaultFolder> {
  const res = await fetch("/api/vault/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: crypto.randomUUID(), teacherCode, name, parentId })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.folder;
}

export async function deleteFolder(id: string, teacherCode: string): Promise<boolean> {
  const res = await fetch(`/api/vault/folders/${id}?teacherCode=${teacherCode}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

export async function fetchScaffolds(teacherCode: string): Promise<VaultScaffold[]> {
  const res = await fetch(`/api/vault/scaffolds?teacherCode=${teacherCode}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.scaffolds;
}

export async function saveScaffold(
  teacherCode: string,
  folder_id: string,
  title: string,
  scaffoldData: Partial<VaultScaffold>
): Promise<VaultScaffold> {
  const res = await fetch("/api/vault/scaffolds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: crypto.randomUUID(), teacherCode, folder_id, title, ...scaffoldData })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.scaffold;
}

export async function deleteScaffold(id: string, teacherCode: string): Promise<boolean> {
  const res = await fetch(`/api/vault/scaffolds/${id}?teacherCode=${teacherCode}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return true;
}
