/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { marked } from 'marked';
import { Loader2, Globe, Cpu, Database, FileText, ChevronRight, Download, FileCode, Sun, Moon, Upload, FileUp, Terminal, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';


// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const TAG_COLORS: Record<string, string> = {
  'PH1': 'bg-[#facc15] text-[#422006] border-[#eab308]',
  'PH2': 'bg-[#1d4ed8] text-white border-[#1e40af]',
  'PH3': 'bg-[#a855f7] text-white border-[#9333ea]',
  'PH4': 'bg-[#dc2626] text-white border-[#b91c1c]',
  'PH5': 'bg-[#06b6d4] text-[#083344] border-[#0891b2]',
  'HU6': 'bg-[#db2777] text-white border-[#be185d]',
  'HU7': 'bg-[#7f1d1d] text-white border-[#450a0a]',
  'HU8': 'bg-[#f97316] text-white border-[#ea580c]',
  'HU9': 'bg-[#fde047] text-[#422006] border-[#ca8a04]',
  'HU10': 'bg-[#22c55e] text-[#052e16] border-[#16a34a]',
};

const TAG_LABELS: Record<string, string> = {
  'PH1': 'Changing River Environments',
  'PH2': 'Changing Coastal Environments',
  'PH3': 'Changing Ecosystems',
  'PH4': 'Tectonic Hazards',
  'PH5': 'Climate Change',
  'HU6': 'Changing Populations',
  'HU7': 'Changing Towns and Cities',
  'HU8': 'Development',
  'HU9': 'Changing Economies',
  'HU10': 'Resource Provision',
};

export default function App({ 
  onBackToPortal, 
  activeUserEmail, 
  activeTeacherCode,
  isDark: propIsDark,
  toggleDark: propToggleDark
}: { 
  onBackToPortal?: () => void;
  activeUserEmail?: string;
  activeTeacherCode?: string;
  isDark?: boolean;
  toggleDark?: () => void;
}) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const detectedUnit = useMemo(() => {
    if (!result) return null;
    const match = result.match(/\b(PH1|PH2|PH3|PH4|PH5|HU6|HU7|HU8|HU9|HU10)\b/i);
    return match ? match[1].toUpperCase() : null;
  }, [result]);
  const [articleTitle, setArticleTitle] = useState<string>('');
  const [activeStep, setActiveStep] = useState(1);
  
  const [localTheme, setLocalTheme] = useState<'dark' | 'light'>('dark');
  const theme = propIsDark !== undefined ? (propIsDark ? 'dark' : 'light') : localTheme;
  const setTheme = propToggleDark ? (() => {}) : setLocalTheme;
  const [isUploading, setIsUploading] = useState(false);
  const [apiKeyDetected, setApiKeyDetected] = useState<boolean | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 1, name: 'Curriculum Alignment', icon: Globe },
    { id: 2, name: 'Conceptual Breakdown', icon: Cpu },
    { id: 3, name: 'Data Extraction', icon: Database },
    { id: 4, name: 'Exam Generation', icon: FileText },
  ];

  const [serverHealth, setServerHealth] = useState<any>(null);

  // Check health on mount
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        setServerHealth(data);
      })
      .catch(err => {
        console.error('Health check failed:', err);
      });

    // Check config for key presence
    fetch('/api/config')
      .then(r => r.json())
      .then(data => {
        setApiKeyDetected(data.apiKeyDetected);
      })
      .catch(err => console.error('Config fetch failed:', err));
  }, []);

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setResult(null);
    setActiveStep(1);

    try {
      // 1. Text Extraction Phase (Backend handles URL fetching/parsing)
      const extractResponse = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputText }),
      });

      if (!extractResponse.ok) {
        const errData = await extractResponse.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to extract article content.');
      }

      const { text: articleText } = await extractResponse.json();
      if (!articleText) {
        throw new Error('No content was extracted from the source.');
      }

      // 2. AI Phase (Server-side)
      console.log("Generating analysis on server...");
      
       const prompt = `
You are the "IGCSE Geography Curriculum Architect." Your role is to ingest raw newspaper articles or publications and transform them into syllabus-aligned case studies and assessment materials for the IGCSE Geography curriculum.

I am providing you with the text of an article. Your job is to process it according to the 4-step logic established below. 

CRITICAL: Start your response with "## ARTICLE TITLE: [Provide a concise, professional title based on the article content]".
Then, follow with the 4 steps, starting each with a specific heading: "## STEP 1: CURRICULUM ALIGNMENT", "## STEP 2: CONCEPTUAL BREAKDOWN", "## STEP 3: DATA EXTRACTION", and "## STEP 4: EXAM GENERATOR".

STEP 1: CURRICULUM ALIGNMENT
- **Article Overview:** Provide a 3-4 sentence analytical synopsis of the article's core geographic problem.
- **Primary Syllabus Link:** Identify the IGCSE Paper and specific IGCSE Unit. YOU MUST ONLY CHOOSE FROM THE FOLLOWING EXACT UNITS. DO NOT INVENT UNITS:
  - Paper 1 (Physical): PH1: Changing River Environments, PH2: Changing Coastal Environments, PH3: Hazardous Environments, PH4: Changing Ecosystems, PH5: Climate Change
  - Paper 2 (Human): HU6: Changing Population, HU7: Changing Towns & Cities, HU8: Development, HU9: Changing Economies, HU10: Resource Provision
- **Case Study Utility:** Grade (1-10) for exam readiness. Explain WHY (e.g. "High AO1 value due to specific 2024 flood statistics").

STEP 2: CONCEPTUAL BREAKDOWN (AO2)
Analyze through the following lenses:
- **Core Concepts:** Place, Scale, Environment, Interdependence, Development, and Change.
- **Sustainable Development Goals (SDGs):** Which goals are compromised or supported? Explain with specific goal numbers.
- **Evaluation & Perspectives:** What are the differing viewpoints of local residents, governments, businesses, and environmental groups regarding this issue?

STEP 3: DATA EXTRACTION (AO1)
Format this as a "Revision Fact-Box": 
1. **STATISTICS TABLE:** | Quantitative Data | Geographic Significance |
2. **SPATIAL CONTEXT:** Locations, regional hierarchy, and environmental context.
3. **CHRONOLOGY:** Timeline of events.
4. **QUALITATIVE DETAIL:** Unique local actors, quotes, or political nuances.

STEP 4: EXAM GENERATOR
Generate IGCSE-style questions:
1. (2 marks): "State..." or "Identify..." directly from the text.
2. (4 marks): "Explain..." or "Describe..." focused on a causal process.
3. (7 marks): IGCSE Case Study Essay: "Discuss..." or "Evaluate..." focusing on place-specific detail and structured evaluation to secure full marks.

FORMATTING:
Output clean Markdown. Use tables for Step 3. Bold key IGCSE command terms. Ensure the Step headings are EXACTLY as defined.ned.

ARTICLE TEXT:
${articleText}
      `;

      const aiResponse = await fetch("/api/newsroom/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: "gemini-2.5-flash" }),
      });

      if (!aiResponse.ok) {
        let msg = "Failed to generate analysis";
        try {
          const errorData = await aiResponse.json();
          msg = errorData.error || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
      }

      const { text: responseText } = await aiResponse.json();
      
      if (!responseText) {
        throw new Error('No assessment material was generated. The content might have been filtered.');
      }

      setResult(responseText);
      
      // Extract title from the response
      const titleMatch = responseText.match(/## ARTICLE TITLE:\s*(.*)/i);
      setArticleTitle(titleMatch?.[1]?.trim() || 'IGCSE Geography Case Study');
    } catch (error: any) {
      console.error("Processing Error:", error);
      const isApiKeyError = error.message.includes('API key') || error.message.includes('400') || error.message.includes('INVALID_ARGUMENT') || error.message.includes('placeholder') || error.message.includes('missing');
      if (isApiKeyError) {
        setResult(`**Critical Error:** ${error.message}\n\n---\n**💡 Troubleshooting Tips:**\n1. Ensure \`GEMINI_API_KEY\` is set correctly in your Render dashboard environment variables.\n2. Redeploy the service on Render to apply environment changes.\n3. Make sure there are no accidental spaces in the secret value.`);
      } else {
        setResult(`**Critical Error:** ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        setInputText(fullText);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
      } else {
        alert('Please upload a PDF or DOCX file.');
      }
    } catch (error) {
      console.error('File parsing failed', error);
      alert('Failed to extract text from file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const activeContent = useMemo(() => {
    if (!result) return '';
    // Look for STEP header patterns
    const stepPattern = /##\s*STEP\s*\d+:[^\n]*/gi;
    const parts = result.split(stepPattern);
    
    // index 0 usually contains the ARTICLE TITLE preamble
    // parts[1..4] for Steps 1..4
    if (parts.length < 5) return result; 

    return parts[activeStep] || 'Section content not found. Ensure the AI output headings are correct.';
  }, [result, activeStep]);

  const handleDownloadMarkdown = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${articleTitle.replace(/[^a-z0-9]/gi, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDOCX = async () => {
    if (!result) return;
    
    setIsLoading(true);
    try {
      const stepPattern = /##\s*STEP\s*\d+:[^\n]*/gi;
      const stepNames = (result.match(stepPattern) || []).map(s => s.replace(/##\s*/, ''));
      const parts = result.split(stepPattern);
      
      const sections = [];

      // Add Title
      sections.push(
        new Paragraph({
          text: articleTitle,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `IG Geography Case Study | Intelligence Unit Report`,
              bold: true,
              color: '2563eb',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
        })
      );

      // Add each step
      for (let i = 1; i < parts.length; i++) {
        const stepName = stepNames[i - 1] || `Step ${i}`;
        const content = parts[i].trim();

        sections.push(
          new Paragraph({
            text: stepName,
            heading: HeadingLevel.HEADING_2,
            pageBreakBefore: i > 1,
            spacing: { before: 400, after: 200 },
          })
        );

        // Split into paragraphs or tables
        const paragraphs = content.split('\n\n');
        for (const p of paragraphs) {
          if (p.includes('|') && p.includes('---')) {
            // Very simple table parsing for docx
            const rows = p.trim().split('\n').filter(r => !r.includes('---'));
            const docRows = rows.map(row => {
              const cells = row.split('|').filter(c => c.trim() !== '' || row.indexOf('|') !== row.lastIndexOf('|'));
              return new TableRow({
                children: cells.map(cell => new TableCell({
                  children: [new Paragraph(cell.trim())],
                  width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
                })),
              });
            });

            sections.push(new Table({
              rows: docRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }));
          } else {
            sections.push(new Paragraph({
              text: p.replace(/\*\*/g, '').trim(),
              spacing: { after: 200 },
            }));
          }
        }
      }

      const doc = new Document({
        sections: [{ children: sections }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${articleTitle.replace(/[^a-z0-9]/gi, '_')}.docx`);
    } catch (error) {
      console.error('DOCX Generation failed', error);
      alert('Word document generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    
    setIsLoading(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Split the result into parts
    const stepPattern = /##\s*STEP\s*\d+:[^\n]*/gi;
    const parts = result.split(stepPattern);
    
    // We expect parts[1..4] to correspond to Steps 1..4
    // Page 1-4 contents
    const stepContents = [
      parts[1] || 'Content not found',
      parts[2] || 'Content not found',
      parts[3] || 'Content not found',
      parts[4] || 'Content not found'
    ];

    const generatePage = async (pageTitle: string, content: string, index: number) => {
      const container = document.createElement('div');
      container.className = 'markdown-body pdf-export-container';
      container.style.width = '800px'; // Logical width for rendering
      container.style.padding = '60px';
      container.style.backgroundColor = 'white';
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.color = '#1e293b';
      
      const htmlContent = marked.parse(content);
      
      container.innerHTML = `
        <style>
          .pdf-export-container { font-family: 'Inter', sans-serif; min-height: 1131px; position: relative; }
          .pdf-header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
          .pdf-title { color: #2563eb; font-size: 24px; font-weight: 800; margin: 0; line-height: 1.2; }
          .pdf-subtitle { color: #64748b; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 5px; }
          .pdf-page-num { background: #2563eb; color: white; padding: 8px 12px; border-radius: 6px; font-weight: 800; font-size: 11px; }
          .pdf-step-tag { display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 4px 12px; border-radius: 99px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 20px; }
          h2 { display: none; } /* Hide the STEP header as we show it in the tag */
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
          th { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 12px; color: #0f172a; }
          td { border: 1px solid #e2e8f0; padding: 10px; font-size: 12px; color: #334155; }
          p { margin-bottom: 12px; font-size: 13px; line-height: 1.6; }
          ul, ol { margin-bottom: 15px; padding-left: 20px; }
          li { font-size: 13px; margin-bottom: 5px; }
          .footer { position: absolute; bottom: 0px; left: 0px; right: 0px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
        </style>
        <div class="pdf-header">
          <div style="flex: 1; padding-right: 20px;">
            <h1 class="pdf-title">${articleTitle}</h1>
            <p class="pdf-subtitle">IG Geography Case Study Unit</p>
          </div>
          <div style="text-align: right;">
            <div class="pdf-page-num">REPORT 0${index + 1}</div>
            <p style="font-size: 9px; color: #94a3b8; margin-top: 5px;">${new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>
        
        <div class="pdf-step-tag">${pageTitle}</div>
        
        <div class="pdf-content">
          ${htmlContent}
        </div>
        
        <div class="footer">
          <div>&copy; ${new Date().getFullYear()} IG News Room - Confidential Resource</div>
          <div style="font-weight: 700;">IG GEOGRAPHY | SYLLABUS 2025</div>
        </div>
      `;
      
      document.body.appendChild(container);

      try {
        const canvas = await html2canvas(container, {
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 800,
          windowWidth: 800
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        if (index > 0) pdf.addPage();
        
        // Calculate dimensions to fit width while maintaining aspect ratio
        const imgProps = pdf.getImageProperties(imgData);
        const finalImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        // Add image - if it exceeds page height, it will be clipped (standard A4 sections should fit)
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, finalImgHeight);
      } finally {
        document.body.removeChild(container);
      }
    };

    try {
      const pageTitles = [
        'Curriculum Alignment',
        'Conceptual Breakdown',
        'Data & Statistics',
        'Exam Generation'
      ];

      for (let i = 0; i < 4; i++) {
        await generatePage(pageTitles[i], stepContents[i], i);
      }

      pdf.save(`${articleTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (error) {
      console.error('PDF Generation failed', error);
      alert('PDF generation failed. Fallback to Markdown format.');
      handleDownloadMarkdown();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`h-screen w-full flex overflow-hidden font-sans transition-colors duration-500 ${
      theme === 'dark' ? 'text-slate-200 bg-slate-950' : 'text-slate-700 bg-slate-50'
    }`}>
      <div className={`mesh-bg ${theme === 'light' ? 'opacity-30' : ''}`}></div>
      <div className="flex h-full w-full p-6 gap-6 relative z-10">
        <aside className={`w-72 flex flex-col p-6 overflow-hidden rounded-3xl border transition-all duration-500 ${
          theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'
        }`}>
          <div className="flex items-center gap-3 mb-10 shrink-0">
            <motion.div 
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className={`w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]`}
            >
              IG
            </motion.div>
            <div>
              <h1 className={`font-black text-xl text-left font-sans tracking-tight leading-[1.2] m-0 p-0 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>News Room</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[9px] uppercase tracking-widest font-black ${
                  theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  'A' Grade Fuel
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-1">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 mb-3">
                Process Pipeline
              </p>
              {steps.map((step) => (
                <button
                  key={step.id}
                  disabled={!result || isLoading}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center justify-between p-3 transition-all group rounded-xl border ${
                    activeStep === step.id && result 
                      ? theme === 'dark' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 ring-1 ring-blue-500/20' : 'bg-blue-50 border-blue-500/40 text-blue-600 shadow-sm'
                      : result 
                        ? theme === 'dark' ? 'hover:bg-white/10 opacity-70 hover:opacity-100 text-slate-300 border-transparent' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
                        : 'opacity-40 grayscale cursor-not-allowed border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <step.icon className={`w-4 h-4 ${activeStep === step.id && result ? theme === 'dark' ? 'text-blue-400' : 'text-blue-500' : 'text-slate-400 group-hover:text-blue-500 transition-colors'}`} />
                    <span className={`text-sm font-semibold ${step.id === 1 && !result ? 'text-[#2563eb]' : ''}`}>{step.name}</span>
                  </div>
                  {activeStep === step.id && result && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>

            <div className={`pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 mb-4">
                Guide Reference
              </p>
              <div className={`p-4 rounded-xl text-[11px] leading-relaxed italic border-l-2 ${
                theme === 'dark' ? 'bg-white/5 border-blue-500/30 text-slate-400' : 'bg-slate-50 border-blue-500/30 text-slate-500 shadow-inner'
              }`}>
                "Cambridge IGCSE Geography enables learners to develop a 'sense of place' by looking at the world around them on a local, regional and global scale."
              </div>
            </div>
          </nav>

          <div className="mt-auto pt-6 shrink-0 space-y-4">
              <button 
                onClick={() => {
                  if (propToggleDark) {
                    propToggleDark();
                  } else {
                    setLocalTheme(theme === 'dark' ? 'light' : 'dark');
                  }
                }}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-300 ${
                  theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span className="text-[10px] font-black uppercase tracking-wider">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                  {theme === 'dark' ? 'DARK' : 'LGHT'}
                </div>
              </button>

              {onBackToPortal && (
                <button 
                  onClick={onBackToPortal}
                  className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 active:scale-95 ${
                    theme === 'dark' 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                      : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 shadow-sm'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">Exit to Portal</span>
                </button>
              )}

              <div className={`p-4 rounded-2xl border transition-all duration-500 ${
                isLoading ? 'bg-blue-600/10 border-blue-500/20' : 
                result ? theme === 'dark' ? 'bg-blue-600/10 border-blue-500/20' : 'bg-blue-50 border-blue-200 shadow-sm' : theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className={`w-3 h-3 ${isLoading ? 'animate-spin text-blue-400' : result ? 'text-blue-500' : 'text-slate-500'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLoading ? 'text-blue-400' : result ? 'text-blue-500' : 'text-slate-500'}`}>
                      {isLoading ? 'Processing' : result ? 'Verified' : 'Ready'}
                    </span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-blue-500 animate-pulse' : result ? 'bg-blue-500' : 'bg-slate-400'}`} />
                </div>
                <p className={`text-[10px] leading-tight font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500 italic'}`}>
                  {isLoading ? 'Synthesizing report...' : result ? 'Assessment logic deployed' : 'Awaiting input source'}
                </p>
              </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col gap-6 overflow-hidden">
          <section className={`flex-1 relative overflow-hidden flex flex-col rounded-3xl border transition-all duration-500 ${
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/30'
          }`}>
            <div className={`absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none ${theme === 'light' ? 'invert' : ''}`}>
              <div className="w-[600px] h-[600px] border-[1px] border-white rounded-full"></div>
              <div className="absolute w-[400px] h-[400px] border-[1px] border-white rounded-full"></div>
              <div className="absolute w-[200px] h-[200px] border-[1px] border-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                   <div className="relative mb-8">
                      <div className={`absolute inset-0 blur-3xl opacity-30 bg-blue-500 animate-pulse`}></div>
                      <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative" />
                   </div>
                   <p className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Processing Assessment Logic</p>
                   <p className={`text-sm mt-3 max-w-sm font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Extracting syllabus themes and synthesizing exam-style prompts...</p>
                </div>
              ) : result ? (
                 <div className="flex-1 flex flex-col overflow-hidden">
                   <div className="flex-1 overflow-y-auto px-12 py-10 custom-scrollbar" ref={contentRef}>
                     {detectedUnit && (
                       <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
                         <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-black tracking-wider border shadow-sm ${TAG_COLORS[detectedUnit] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                           {detectedUnit}
                         </span>
                         <span className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                           {TAG_LABELS[detectedUnit]}
                         </span>
                       </div>
                     )}
                     <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="markdown-body max-w-none"
                      >
                        <div className={`prose max-w-none prose-headings:font-bold prose-headings:tracking-tight ${
                          theme === 'dark' 
                            ? 'prose-invert prose-blue prose-h2:text-blue-400 prose-p:text-slate-300 prose-a:text-blue-400 prose-strong:text-white prose-table:w-full prose-table:border prose-table:border-white/10 prose-th:bg-white/5 prose-th:p-4 prose-th:text-left prose-td:p-4 prose-td:border-t prose-td:border-white/5' 
                            : 'prose-slate prose-blue prose-h2:text-blue-600 prose-p:text-slate-600 prose-a:text-blue-600 prose-strong:text-slate-900 prose-table:w-full prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:p-4 prose-th:text-left prose-td:p-4 prose-td:border-t prose-td:border-slate-100'
                        }`}>
                          <Markdown remarkPlugins={[remarkGfm]}>{activeContent}</Markdown>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  {/* Bottom Control Bar for Results */}
                  <div className={`p-6 border-t flex items-center justify-between mx-4 mb-4 rounded-2xl ${
                    theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Current View</span>
                        <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{steps.find(s => s.id === activeStep)?.name}</span>
                      </div>
                      <div className={`flex rounded-lg overflow-hidden border shrink-0 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                        {steps.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setActiveStep(s.id)}
                            className={`px-4 py-2 text-xs font-bold transition-all ${
                              activeStep === s.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : theme === 'dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-white text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            Step {s.id}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`flex p-1 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                        <button 
                          onClick={handleDownloadPDF}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-blue-500 hover:text-white rounded-lg text-xs font-bold transition-all ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </button>
                        <button 
                          onClick={handleDownloadDOCX}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-blue-500 hover:text-white rounded-lg text-xs font-bold transition-all ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          DOCX
                        </button>
                      </div>

                      <button 
                        onClick={() => {
                          setResult(null);
                          setInputText('');
                          setArticleTitle('');
                          setActiveStep(1);
                        }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 border ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
                        }`}
                      >
                        Reset Engine
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col p-10 overflow-y-auto custom-scrollbar">
                  <div className="mb-12">
                    <h3 className={`text-[32px] font-bold leading-tight mb-4 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                      IG GEOGRAPHY SYLLABUS
                    </h3>
                    <p className={`max-w-2xl text-base leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Transform any news article into a syllabus-aligned case study. Our system extracts conceptual lenses, spatial data, and generates professional assessment material.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 flex-1 max-w-4xl">
                    <div className={`p-8 border-t-2 transition-all rounded-2xl ${
                      theme === 'dark' 
                        ? 'border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10' 
                        : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50 shadow-sm'
                    }`}>
                       <div className="flex items-center gap-3 text-blue-500 mb-4">
                         <Globe className="w-5 h-5" />
                         <div className="text-xs font-black uppercase tracking-widest">Alignment</div>
                       </div>
                       <p className={`text-sm leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-650'}`}>
                         Maps content to IGCSE Paper 1 and Paper 2 with precise Unit alignment.
                       </p>
                    </div>
                    <div className={`p-8 border-t-2 transition-all rounded-2xl ${
                      theme === 'dark' 
                        ? 'border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10' 
                        : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50 shadow-sm'
                    }`}>
                      <div className="flex items-center gap-3 text-blue-500 mb-4">
                        <Cpu className="w-5 h-5" />
                        <div className="text-xs font-black uppercase tracking-widest">Concepts</div>
                      </div>
                      <p className={`text-sm leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        Identification of core concepts using IGCSE Geography (Place, Scale, Environment, Interdependence, Development, and Change).
                      </p>
                    </div>
                    <div className={`p-8 border-t-2 transition-all rounded-2xl ${
                      theme === 'dark' 
                        ? 'border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10' 
                        : 'border-purple-200 bg-purple-50/30 hover:bg-purple-50 shadow-sm'
                    }`}>
                      <div className="flex items-center gap-3 text-purple-500 mb-4">
                        <Database className="w-5 h-5" />
                        <div className="text-xs font-black uppercase tracking-widest">Data Units</div>
                      </div>
                      <p className={`text-sm leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        Synthesizes spatial statistics and chronologies into revision fact-boxes.
                      </p>
                    </div>
                    <div className={`p-8 border-t-2 transition-all rounded-2xl ${
                      theme === 'dark' 
                        ? 'border-orange-500/40 bg-orange-500/5 hover:bg-orange-500/10' 
                        : 'border-orange-200 bg-orange-50/30 hover:bg-orange-50 shadow-sm'
                    }`}>
                      <div className="flex items-center gap-3 text-orange-500 mb-4">
                        <FileText className="w-5 h-5" />
                        <div className="text-xs font-black uppercase tracking-widest">Assessments</div>
                      </div>
                      <p className={`text-sm leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        Professional 2-7 mark questions calibrated to IGCSE command terms.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {!result && !isLoading && (
                <div className={`mt-auto p-8 border-dashed flex items-center justify-between mx-10 mb-10 transition-colors rounded-2xl border ${
                  theme === 'dark' ? 'border-slate-700/50 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-5">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-colors cursor-pointer group ${
                        theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500 hover:bg-blue-500/20' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {isUploading ? <Loader2 className="w-7 h-7 animate-spin" /> : <FileUp className="w-7 h-7 group-hover:scale-110 transition-transform" />}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept=".pdf,.docx" 
                      className="hidden" 
                    />
                    <div>
                      <p className={`text-sm font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Source Integration</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium italic">Paste URL, text, or <span onClick={() => fileInputRef.current?.click()} className="text-blue-500 hover:underline cursor-pointer">upload PDF/DOCX</span></p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full max-w-lg ml-6">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleProcess();
                      }}
                      placeholder="Enter news article content or URL..."
                      className={`border rounded-xl px-5 py-3 text-xs flex-1 focus:outline-none focus:ring-1 transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20' 
                          : 'bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-blue-500/10 shadow-sm'
                      }`}
                    />
                    <button 
                      onClick={handleProcess}
                      disabled={!inputText.trim() || isLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                    >
                      Analyze
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
