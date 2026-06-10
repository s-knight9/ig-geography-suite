/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PaperType = 'Paper 1' | 'Paper 2' | 'Paper 3';

export type TargetMarks = 
  | '2+2 marks' 
  | '4 marks' 
  | '3+3 marks' 
  | '6 marks' 
  | '10 marks' 
  | '12 marks' 
  | '16 marks';

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
