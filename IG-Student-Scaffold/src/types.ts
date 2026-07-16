/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PaperType = 'Paper 1' | 'Paper 2';

export type TargetMarks = 
  | '3 marks' 
  | '4 marks' 
  | '5 marks' 
  | '7 marks';

export type ParagraphFramework = 'PEE' | 'PEEL' | 'PEECAL';

export interface ScaffoldRequest {
  paperType: PaperType;
  targetMarks: TargetMarks;
  framework: ParagraphFramework;
  wordBankToggle: boolean;
  question: string;
  keywords: string;
  attachmentData?: string; // extracted text from attachment
}

export interface ScaffoldResponse {
  scaffold: string;
  writingFrame: string;
}
