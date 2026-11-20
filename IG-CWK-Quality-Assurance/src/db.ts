import { db, storage } from "./firebase";
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { EvaluationResult, ComparativeEvaluationResult } from "./types";

export interface StudentSubmission {
  candidateName: string;
  className: string;
  assignmentName: string;
  status: "Draft" | "Final";

  draftEvaluation?: EvaluationResult;
  draftTeacherScores?: Record<string, number>;
  draftPdfUrl?: string;
  draftStoragePath?: string;

  finalEvaluation?: EvaluationResult;
  finalTeacherScores?: Record<string, number>;
  finalPdfUrl?: string;
  finalStoragePath?: string;

  comparativeEvaluation?: ComparativeEvaluationResult;
  updatedAt?: string;
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
      // Clean up PDFs in storage before deleting document
      if (s.draftStoragePath) await deleteObject(ref(storage, s.draftStoragePath)).catch(() => { });
      if (s.finalStoragePath) await deleteObject(ref(storage, s.finalStoragePath)).catch(() => { });

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
      // Clean up PDFs in storage before deleting document
      if (s.draftStoragePath) await deleteObject(ref(storage, s.draftStoragePath)).catch(() => { });
      if (s.finalStoragePath) await deleteObject(ref(storage, s.finalStoragePath)).catch(() => { });

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

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (typeof obj === 'object') {
    const clean: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        clean[k] = sanitizeForFirestore(v);
      }
    }
    return clean;
  }
  return obj;
}

export async function saveDirectoryData(data: StudentSubmission[]) {
  const batch = writeBatch(db);
  for (const s of data) {
    const docId = getSubmissionDocId(s);
    batch.set(doc(db, SUBMISSIONS_COL, docId), sanitizeForFirestore(s));
  }
  await batch.commit();
}

function getSubmissionDocId(s: Partial<StudentSubmission>): string {
  const cleanName = (name?: string) => (name || 'student').replace(/\s*-\s*(DRAFT|FINAL|Draft|Final)$/i, '').trim().toLowerCase();
  const cls = (s.className || 'default_class').trim().toLowerCase();
  const asn = (s.assignmentName || 'default_assignment').trim().toLowerCase();
  const id = `${cleanName(s.candidateName)}_${cls}_${asn}`;
  return id.replace(/[^a-z0-9_]/g, '-');
}

export async function addOrUpdateSubmission(submission: StudentSubmission) {
  try {
    const docId = getSubmissionDocId(submission);
    const docRef = doc(db, SUBMISSIONS_COL, docId);
    const sanitized = sanitizeForFirestore(submission);

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const existing = docSnap.data() as StudentSubmission;
      await setDoc(docRef, { ...existing, ...sanitized }, { merge: true });
    } else {
      await setDoc(docRef, sanitized);
    }
  } catch (error) {
    console.error("Error adding/updating submission:", error);
    throw error;
  }
}

export async function deleteSubmission(submission: StudentSubmission) {
  try {
    // Clean up PDFs in Firebase Storage first
    if (submission.draftStoragePath) {
      await deleteObject(ref(storage, submission.draftStoragePath)).catch(() => { });
    }
    if (submission.finalStoragePath) {
      await deleteObject(ref(storage, submission.finalStoragePath)).catch(() => { });
    }

    const docId = getSubmissionDocId(submission);
    await deleteDoc(doc(db, SUBMISSIONS_COL, docId));
  } catch (error) {
    console.error("Error deleting submission:", error);
  }
}

// --- NEW STORAGE FUNCTIONS ---

export async function uploadSubmissionPdf(
  file: File,
  submission: StudentSubmission,
  stage: "Draft" | "Final"
): Promise<{ pdfUrl: string; storagePath: string }> {
  const docId = getSubmissionDocId(submission);
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const safeClassName = (submission.className || 'default_class').trim().replace(/[^a-zA-Z0-9._-]/g, '_');
  const safeAssignmentName = (submission.assignmentName || 'default_assignment').trim().replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `ig_cwk_qa/${safeClassName}/${safeAssignmentName}/${docId}/${stage}_${Date.now()}_${safeFileName}`;
  const fileRef = ref(storage, storagePath);

  // Clean up existing PDF for this stage if replacing an old file
  const existingStoragePath = stage === "Draft" ? submission.draftStoragePath : submission.finalStoragePath;
  if (existingStoragePath) {
    try {
      await deleteObject(ref(storage, existingStoragePath));
    } catch (e) {
      console.warn("Could not delete previous PDF (it may not exist):", e);
    }
  }

  // Upload the new PDF and get the URL
  await uploadBytes(fileRef, file, { contentType: 'application/pdf' });
  const pdfUrl = await getDownloadURL(fileRef);

  return { pdfUrl, storagePath };
}

export async function findExistingSubmission(
  candidateName: string,
  className: string,
  assignmentName: string
): Promise<StudentSubmission | null> {
  try {
    const docId = getSubmissionDocId({ candidateName, className, assignmentName });
    const docRef = doc(db, SUBMISSIONS_COL, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as StudentSubmission;
    }
  } catch (error) {
    console.error("Error finding existing submission:", error);
  }
  return null;
}

export async function saveGradedSubmissionWithPdf({
  file,
  candidateName,
  className,
  assignmentName,
  stage,
  evaluation,
  teacherScores
}: {
  file?: File | null;
  candidateName: string;
  className: string;
  assignmentName: string;
  stage: "Draft" | "Final";
  evaluation: EvaluationResult;
  teacherScores?: Record<string, number>;
}): Promise<StudentSubmission> {
  // Check the database for an existing "Draft" submission for that candidate in the same class/assignment
  const existing = await findExistingSubmission(candidateName, className, assignmentName);
  const computedStatus: "Draft" | "Final" =
    stage === "Final" || Boolean(existing?.finalEvaluation) ? "Final" : "Draft";

  const baseSubmission: StudentSubmission = {
    ...(existing || {}),
    candidateName,
    className,
    assignmentName,
    status: computedStatus
  };

  let pdfUrl = stage === "Draft" ? existing?.draftPdfUrl : existing?.finalPdfUrl;
  let storagePath = stage === "Draft" ? existing?.draftStoragePath : existing?.finalStoragePath;

  // Upload raw File to Firebase Storage
  if (file) {
    try {
      const uploadRes = await uploadSubmissionPdf(file, baseSubmission, stage);
      pdfUrl = uploadRes.pdfUrl;
      storagePath = uploadRes.storagePath;
    } catch (err: any) {
      console.error("Firebase Storage PDF upload error:", err);
      alert(`Coursework PDF upload failed: ${err.message}`);
    }
  }

  const defaultScores = {
    ao1_knowledge: evaluation.scores?.ao1_knowledge?.score || 0,
    ao2_observation: evaluation.scores?.ao2_observation?.score || 0,
    ao2_organisation: evaluation.scores?.ao2_organisation?.score || 0,
    ao2_analysis: evaluation.scores?.ao2_analysis?.score || 0,
    ao3_conclusion: evaluation.scores?.ao3_conclusion?.score || 0,
  };

  // Merge the Final data into existing record or set Draft data
  const mergedSubmission: StudentSubmission = {
    ...baseSubmission,
    status: computedStatus,
    updatedAt: new Date().toISOString(),
    ...(stage === "Final" ? {
      draftEvaluation: existing?.draftEvaluation,
      draftTeacherScores: existing?.draftTeacherScores,
      draftPdfUrl: existing?.draftPdfUrl,
      draftStoragePath: existing?.draftStoragePath,
      finalEvaluation: evaluation,
      finalTeacherScores: teacherScores || existing?.finalTeacherScores || defaultScores,
      finalPdfUrl: pdfUrl,
      finalStoragePath: storagePath
    } : {
      draftEvaluation: evaluation,
      draftTeacherScores: teacherScores || existing?.draftTeacherScores || defaultScores,
      draftPdfUrl: pdfUrl,
      draftStoragePath: storagePath,
      finalEvaluation: existing?.finalEvaluation,
      finalTeacherScores: existing?.finalTeacherScores,
      finalPdfUrl: existing?.finalPdfUrl,
      finalStoragePath: existing?.finalStoragePath
    })
  };

  await addOrUpdateSubmission(mergedSubmission);
  return mergedSubmission;
}

export async function saveComparativeSubmissionWithPdf({
  file1,
  file2,
  candidateName,
  className,
  assignmentName,
  comparativeEvaluation,
  stage = "Final"
}: {
  file1?: File | null;
  file2?: File | null;
  candidateName: string;
  className: string;
  assignmentName: string;
  comparativeEvaluation: ComparativeEvaluationResult;
  stage?: "Draft" | "Final";
}): Promise<StudentSubmission> {
  const existing = await findExistingSubmission(candidateName, className, assignmentName);

  const baseSubmission: StudentSubmission = {
    ...(existing || {}),
    candidateName,
    className,
    assignmentName,
    status: stage,
    comparativeEvaluation,
    updatedAt: new Date().toISOString()
  };

  let draftPdfUrl = existing?.draftPdfUrl;
  let draftStoragePath = existing?.draftStoragePath;
  let finalPdfUrl = existing?.finalPdfUrl;
  let finalStoragePath = existing?.finalStoragePath;

  if (file1) {
    try {
      const upload1 = await uploadSubmissionPdf(file1, baseSubmission, "Draft");
      draftPdfUrl = upload1.pdfUrl;
      draftStoragePath = upload1.storagePath;
    } catch (err: any) {
      console.error("Firebase Storage comparative file1 upload error:", err);
      alert(`CWK 1 PDF upload failed: ${err.message}`);
    }
  }

  if (file2) {
    try {
      const upload2 = await uploadSubmissionPdf(file2, baseSubmission, "Final");
      finalPdfUrl = upload2.pdfUrl;
      finalStoragePath = upload2.storagePath;
    } catch (err: any) {
      console.error("Firebase Storage comparative file2 upload error:", err);
      alert(`CWK 2 PDF upload failed: ${err.message}`);
    }
  }

  const mergedSubmission: StudentSubmission = {
    ...baseSubmission,
    status: stage,
    comparativeEvaluation,
    updatedAt: new Date().toISOString(),
    draftPdfUrl,
    draftStoragePath,
    finalPdfUrl,
    finalStoragePath
  };

  await addOrUpdateSubmission(mergedSubmission);
  return mergedSubmission;
}