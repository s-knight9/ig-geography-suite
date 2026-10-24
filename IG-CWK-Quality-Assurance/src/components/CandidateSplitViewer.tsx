import React from 'react';
import SplitScreenViewer from './SplitScreenViewer';
import { StudentSubmission } from '../db';

export interface CandidateSplitViewerProps {
  candidate?: StudentSubmission;
  student?: StudentSubmission;
  initialStage?: 'Draft' | 'Final' | 'Compare';
  onClose: () => void;
  onUpdateStudent?: (updated: StudentSubmission) => void;
  onUploadFinal?: (student: StudentSubmission) => void;
  isDarkMode: boolean;
  toggleDarkMode?: () => void;
}

export default function CandidateSplitViewer({
  candidate,
  student,
  ...rest
}: CandidateSplitViewerProps) {
  const studentData = candidate || student;
  if (!studentData) return null;

  return <SplitScreenViewer student={studentData} {...rest} />;
}
