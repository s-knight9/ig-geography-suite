export type PaperType = "1" | "2" | "3";
export type MarkValue = "10" | "12" | "16";

export interface ClassFolder {
  id: string;
  teacherId: string;
  name: string;
}

export interface AssignmentFolder {
  id: string;
  classId: string;
  name: string;
}

export interface SubFolder {
  id: string;
  assignmentId: string;
  name: string;
}

export interface SavedEssay {
  id: string;
  teacherId: string;
  classId?: string;
  assignmentId?: string;
  subFolderId?: string;
  studentName: string;
  paper: PaperType;
  marks: MarkValue;
  question: string;
  essay: string;
  assessment: string;
  teacherScore?: number;
  date: string;
}
