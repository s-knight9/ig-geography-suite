import { db } from "./firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  query,
  where
} from "firebase/firestore";
import { EvaluationResult } from "./types";

export interface StudentSubmission {
  candidateName: string;
  className: string;
  assignmentName: string;
  draftEvaluation?: EvaluationResult;
  draftTeacherScores?: Record<string, number>; // key: ao1_knowledge etc.
  finalEvaluation?: EvaluationResult;
  finalTeacherScores?: Record<string, number>;
  status: "Draft" | "Final";
}

export interface DirectoryStructure {
  classes: string[];
  assignments: Record<string, string[]>;
}

const CONFIG_DOC = "config/structure";
const SUBMISSIONS_COL = "submissions";

export async function loadStructure(): Promise<DirectoryStructure> {
  try {
    const docRef = doc(db, CONFIG_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as DirectoryStructure;
    }
  } catch (error) {
    console.error("Error loading structure:", error);
  }
  return { classes: [], assignments: {} };
}

export async function saveStructure(data: DirectoryStructure) {
  try {
    const docRef = doc(db, CONFIG_DOC);
    await setDoc(docRef, data);
  } catch (error) {
    console.error("Error saving structure:", error);
  }
}

export async function createClass(className: string) {
  const struct = await loadStructure();
  if (!struct.classes.includes(className)) {
    struct.classes.push(className);
    await saveStructure(struct);
  }
}

export async function createAssignment(className: string, assignmentName: string) {
  const struct = await loadStructure();
  if (!struct.classes.includes(className)) {
    struct.classes.push(className);
  }
  if (!struct.assignments[className]) {
    struct.assignments[className] = [];
  }
  if (!struct.assignments[className].includes(assignmentName)) {
    struct.assignments[className].push(assignmentName);
    await saveStructure(struct);
  }
}

export async function renameClass(oldName: string, newName: string) {
  // Update explicitly saved structure
  const struct = await loadStructure();
  const classIdx = struct.classes.indexOf(oldName);
  if (classIdx >= 0) {
    struct.classes[classIdx] = newName;
  }
  if (struct.assignments[oldName]) {
    struct.assignments[newName] = struct.assignments[oldName];
    delete struct.assignments[oldName];
  }
  await saveStructure(struct);

  // Update all submission entries
  const submissions = await loadDirectoryData();
  const batch = writeBatch(db);
  let changed = false;
  
  for (const s of submissions) {
    if (s.className === oldName) {
      const docId = getSubmissionDocId(s);
      const oldDocRef = doc(db, SUBMISSIONS_COL, docId);
      
      const updatedSubmission = { ...s, className: newName };
      const newDocId = getSubmissionDocId(updatedSubmission);
      const newDocRef = doc(db, SUBMISSIONS_COL, newDocId);
      
      batch.delete(oldDocRef);
      batch.set(newDocRef, updatedSubmission);
      changed = true;
    }
  }
  if (changed) await batch.commit();
}

export async function renameAssignment(className: string, oldName: string, newName: string) {
  const struct = await loadStructure();
  if (struct.assignments[className]) {
    const idx = struct.assignments[className].indexOf(oldName);
    if (idx >= 0) {
      struct.assignments[className][idx] = newName;
      await saveStructure(struct);
    }
  }

  const submissions = await loadDirectoryData();
  const batch = writeBatch(db);
  let changed = false;
  
  for (const s of submissions) {
    if (s.className === className && s.assignmentName === oldName) {
      const docId = getSubmissionDocId(s);
      const oldDocRef = doc(db, SUBMISSIONS_COL, docId);
      
      const updatedSubmission = { ...s, assignmentName: newName };
      const newDocId = getSubmissionDocId(updatedSubmission);
      const newDocRef = doc(db, SUBMISSIONS_COL, newDocId);
      
      batch.delete(oldDocRef);
      batch.set(newDocRef, updatedSubmission);
      changed = true;
    }
  }
  if (changed) await batch.commit();
}

export async function deleteClass(className: string) {
  const struct = await loadStructure();
  struct.classes = struct.classes.filter(c => c !== className);
  delete struct.assignments[className];
  await saveStructure(struct);

  const submissions = await loadDirectoryData();
  const batch = writeBatch(db);
  let count = 0;
  for (const s of submissions) {
    if (s.className === className) {
      const docId = getSubmissionDocId(s);
      batch.delete(doc(db, SUBMISSIONS_COL, docId));
      count++;
    }
  }
  if (count > 0) await batch.commit();
}

export async function deleteAssignment(className: string, assignmentName: string) {
  const struct = await loadStructure();
  if (struct.assignments[className]) {
    struct.assignments[className] = struct.assignments[className].filter(a => a !== assignmentName);
    await saveStructure(struct);
  }

  const submissions = await loadDirectoryData();
  const batch = writeBatch(db);
  let count = 0;
  for (const s of submissions) {
    if (s.className === className && s.assignmentName === assignmentName) {
      const docId = getSubmissionDocId(s);
      batch.delete(doc(db, SUBMISSIONS_COL, docId));
      count++;
    }
  }
  if (count > 0) await batch.commit();
}

export async function loadDirectoryData(): Promise<StudentSubmission[]> {
  try {
    const colRef = collection(db, SUBMISSIONS_COL);
    const querySnapshot = await getDocs(colRef);
    return querySnapshot.docs.map(doc => doc.data() as StudentSubmission);
  } catch (error) {
    console.error("Error loading directory data:", error);
    return [];
  }
}

export async function saveDirectoryData(data: StudentSubmission[]) {
  // This function is less efficient in Firestore than total replacement in localStorage
  // Ideally, we'd only save individual changed items, but to maintain compat:
  const batch = writeBatch(db);
  for (const s of data) {
    const docId = getSubmissionDocId(s);
    batch.set(doc(db, SUBMISSIONS_COL, docId), s);
  }
  await batch.commit();
}

function getSubmissionDocId(s: StudentSubmission): string {
  const cleanName = (name: string) => name.replace(/\s*-\s*(DRAFT|FINAL|Draft|Final)$/i, '').trim().toLowerCase();
  const id = `${cleanName(s.candidateName)}_${s.className.trim().toLowerCase()}_${s.assignmentName.trim().toLowerCase()}`;
  return id.replace(/[^a-z0-9_]/g, '-');
}

export async function addOrUpdateSubmission(submission: StudentSubmission) {
  try {
    const docId = getSubmissionDocId(submission);
    const docRef = doc(db, SUBMISSIONS_COL, docId);
    
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const existing = docSnap.data() as StudentSubmission;
      await setDoc(docRef, { ...existing, ...submission }, { merge: true });
    } else {
      await setDoc(docRef, submission);
    }
  } catch (error) {
    console.error("Error adding/updating submission:", error);
  }
}

export async function deleteSubmission(submission: StudentSubmission) {
  try {
    const docId = getSubmissionDocId(submission);
    await deleteDoc(doc(db, SUBMISSIONS_COL, docId));
  } catch (error) {
    console.error("Error deleting submission:", error);
  }
}

