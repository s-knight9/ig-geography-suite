import React, { useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { Download, FileText, CheckCircle, ChevronDown, FileImage as FilePdf } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ScaffoldViewProps {
  scaffold: string;
  writingFrame: string;
  question: string;
  marks: string;
  initialViewMode?: 'scaffold' | 'frame';
}

export function ScaffoldView({ scaffold, writingFrame, question, marks, initialViewMode = 'scaffold' }: ScaffoldViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'scaffold' | 'frame'>(initialViewMode);

  React.useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode, scaffold, writingFrame]);

  const content = viewMode === 'scaffold' ? scaffold : writingFrame;
  const viewTitle = viewMode === 'scaffold' ? 'Scaffold Blueprint' : 'Writing Frame';
  const exportPrefix = viewMode === 'scaffold' ? 'IB_Scaffold' : 'IB_Writing_Frame';

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPdf = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    setIsMenuOpen(false);

    try {
      // 1. Create a clean, off-screen container for capture
      const printContainer = document.createElement('div');
      const uniqueId = 'pdf-export-anchor-' + Date.now();
      printContainer.id = uniqueId;
      printContainer.style.position = 'fixed';
      printContainer.style.left = '-10000px';
      printContainer.style.top = '0';
      printContainer.style.width = '800px';
      printContainer.style.backgroundColor = '#ffffff';
      printContainer.style.zIndex = '-10000';
      
      // 2. Clone content and inject a simple header matching the DOCX style
      printContainer.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; color: #334155; background: #ffffff;">
          <div style="margin-bottom: 30px; padding: 24px; background-color: #f8fafc; border-left: 6px solid #10b981; border-radius: 4px;">
            <p style="font-weight: bold; font-style: italic; font-size: 16pt; margin: 0; color: #1e293b;">
              ${question} [${marks}]
            </p>
          </div>
          <div id="capture-content">
            ${contentRef.current.innerHTML}
          </div>
        </div>
      `;

      // 3. AGGRESSIVE SANITIZATION: Remove all problematic classes and scrubbing problematic colors
      const captureNode = printContainer.querySelector('#capture-content')!;
      const sanitize = (node: Element) => {
        if (node instanceof HTMLElement) {
          // Force removal of all Tailwind classes which often use oklch
          node.removeAttribute('class');
          node.className = '';
          
          // Clear any dynamic/complex inline styles
          if (node.style) {
            ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'].forEach(p => {
              const v = (node.style as any)[p];
              if (v && v.includes('oklch')) (node.style as any)[p] = '';
            });
          }

          // Apply clean, standard typography styles directly to elements
          const tag = node.tagName.toLowerCase();
          if (tag === 'h1') {
            node.style.fontSize = '24pt';
            node.style.color = '#064e3b';
            node.style.borderBottom = '2px solid #10b981';
            node.style.paddingBottom = '10px';
            node.style.marginTop = '20px';
            node.style.marginBottom = '15px';
            node.style.fontWeight = 'bold';
            node.style.display = 'block';
          } else if (tag === 'h2') {
            node.style.fontSize = '18pt';
            node.style.color = '#10b981';
            node.style.marginTop = '20px';
            node.style.marginBottom = '10px';
            node.style.fontWeight = 'bold';
            node.style.display = 'block';
          } else if (tag === 'h3') {
            node.style.fontSize = '14pt';
            node.style.borderLeft = '4px solid #10b981';
            node.style.paddingLeft = '15px';
            node.style.marginTop = '15px';
            node.style.marginBottom = '10px';
            node.style.fontWeight = 'bold';
            node.style.display = 'block';
          } else if (tag === 'p') {
            node.style.marginBottom = '1em';
            node.style.fontSize = '11pt';
            node.style.lineHeight = '1.6';
            node.style.display = 'block';
          } else if (tag === 'ul' || tag === 'ol') {
            node.style.paddingLeft = '2.5em';
            node.style.marginBottom = '1.5em';
            node.style.display = 'block';
          } else if (tag === 'li') {
            node.style.marginBottom = '0.5em';
            node.style.fontSize = '11pt';
            node.style.display = 'list-item';
          } else if (tag === 'strong') {
            node.style.fontWeight = 'bold';
            node.style.color = '#0f172a';
          } else if (tag === 'blockquote') {
            node.style.borderLeft = '4px solid #e2e8f0';
            node.style.paddingLeft = '1em';
            node.style.color = '#64748b';
            node.style.fontStyle = 'italic';
            node.style.margin = '1em 0';
          }
        }
        Array.from(node.children).forEach(sanitize);
      };
      sanitize(captureNode);

      document.body.appendChild(printContainer);

      // 4. Force a delay and ensure full height is calculated
      await new Promise(r => setTimeout(r, 400));
      printContainer.style.height = 'auto';
      const scrollHeight = Math.max(printContainer.scrollHeight, printContainer.offsetHeight);

      // 5. Capture as high-res canvas with aggressive onclone scrubbing
      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 800,
        height: scrollHeight,
        windowWidth: 800,
        windowHeight: scrollHeight,
        onclone: (clonedDoc) => {
          // SCRUB OKLCH: html2canvas kills the process if it sees oklch in ANY stylesheet
          const styles = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styles.length; i++) {
            try {
              if (styles[i].innerHTML.includes('oklch')) {
                // More comprehensive regex to catch various oklch patterns
                styles[i].innerHTML = styles[i].innerHTML.replace(/oklch\([^)]+\)/g, '#4b5563');
              }
            } catch (e) {
              console.warn('Failed to scrub a style block', e);
            }
          }
          
          // Remove all external links which might load oklch-heavy CSS (like Tailwind 4)
          const links = clonedDoc.getElementsByTagName('link');
          for (let i = links.length - 1; i >= 0; i--) {
            if (links[i].rel === 'stylesheet') {
              links[i].remove();
            }
          }

          // Force visibility for the print container in the clone
          const cloneContainer = clonedDoc.getElementById(uniqueId);
          if (cloneContainer) {
            cloneContainer.style.opacity = '1';
            cloneContainer.style.visibility = 'visible';
            cloneContainer.style.left = '0';
            cloneContainer.style.position = 'relative';
          }
        }
      });

      document.body.removeChild(printContainer);

      // 6. Robust Multi-page Slicing with Strict Footer Margin
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const topMarginMm = 20;
      const footerMarginMm = 76.2; // EXACTLY 3 inches (76.2 mm)
      const bufferMm = 5; // Safety gap before the footer zone
      const usableHeightMm = pdfHeight - topMarginMm - footerMarginMm - bufferMm;
      
      // Calculate pixel-to-mm ratio based on the high-res canvas
      const pxPerMm = canvas.width / pdfWidth;
      const sliceHeightPx = usableHeightMm * pxPerMm;
      
      let yPositionPx = 0;
      let pageCount = 0;

      while (yPositionPx < canvas.height) {
        if (pageCount > 0) {
          pdf.addPage();
        }

        // Determine current slice height (last slice may be shorter)
        const currentSliceHeightPx = Math.min(sliceHeightPx, canvas.height - yPositionPx);
        const currentDisplayHeightMm = currentSliceHeightPx / pxPerMm;

        // Create a temporary canvas for this specific page slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = currentSliceHeightPx;
        
        const sliceCtx = sliceCanvas.getContext('2d');
        if (sliceCtx) {
          sliceCtx.fillStyle = '#ffffff';
          sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          
          sliceCtx.drawImage(
            canvas,
            0, yPositionPx, canvas.width, currentSliceHeightPx,
            0, 0, canvas.width, currentSliceHeightPx
          );

          const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
          
          pdf.addImage(sliceData, 'JPEG', 0, topMarginMm, pdfWidth, currentDisplayHeightMm);
          
          // ABSOLUTE REDUNDANT PROTECTIVE MASKS
          pdf.setFillColor(255, 255, 255);
          // Cover the top margin area (safety against bleeds)
          pdf.rect(0, 0, pdfWidth, topMarginMm, 'F');
          // Cover the bottom footer margin (Strict 3 inches)
          pdf.rect(0, pdfHeight - footerMarginMm, pdfWidth, footerMarginMm, 'F');

          // Professional Footer
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184); // slate-400
          pdf.text(`IB Student Scaffold • Page ${pageCount + 1}`, pdfWidth / 2, pdfHeight - 15, { align: 'center' });
        }

        yPositionPx += currentSliceHeightPx;
        pageCount++;
      }

      pdf.save(`${exportPrefix}_${marks}marks.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF generation encountered a rendering issue. Please use DOCX export as an alternative.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsDocx = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    setIsMenuOpen(false);

    try {
      const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>IB Essay Scaffold</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #334155; }
            .question-box { 
              margin-bottom: 30px; 
              padding: 20px; 
              background-color: #f8fafc; 
              border-left: 5px solid #10b981;
              color: #1e293b;
              font-style: italic;
              font-weight: bold;
            }
            h1, h2, h3 { color: #064e3b; margin-top: 1.5em; margin-bottom: 0.5em; }
            h1 { font-size: 24pt; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
            h2 { font-size: 18pt; color: #10b981; }
            h3 { font-size: 14pt; border-left: 4px solid #10b981; padding-left: 15px; }
            p { margin: 1em 0; }
            ul, ol { margin: 1em 0; padding-left: 2em; }
            li { margin-bottom: 0.5em; }
            strong { font-weight: bold; color: #0f172a; }
          </style>
        </head>
        <body>
          <div style="width: 100%; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div class="question-box">
              ${question} [${marks}]
            </div>
            ${contentRef.current.innerHTML}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
      downloadFile(blob, `${exportPrefix}.doc`);
    } catch (error) {
      console.error('DOCX export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const sanitizedContent = content.replace(/<br\s*\/?>/gi, ' | ');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full relative transition-colors"
    >
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{viewTitle}</h2>
          </div>

          {(scaffold && writingFrame) && (
            <>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => setViewMode('scaffold')}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-md transition-all ${viewMode === 'scaffold' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
                >
                  Scaffold
                </button>
                <button 
                  onClick={() => setViewMode('frame')}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-md transition-all ${viewMode === 'frame' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
                >
                  Writing Frame
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : (
              <>
                <Download className="w-3 h-3" />
                Export {viewMode === 'scaffold' ? 'Scaffold' : 'Frame'}
                <ChevronDown className={`w-3 h-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-20 py-1 overflow-hidden"
                >
                  <button onClick={exportAsPdf} className="w-full px-4 py-2 text-left text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2 uppercase tracking-wide transition-colors">
                    <FilePdf className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                  <button onClick={exportAsDocx} className="w-full px-4 py-2 text-left text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2 uppercase tracking-wide transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                    Download DOCX
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 p-6 md:p-8 custom-scrollbar bg-white dark:bg-slate-900">
        <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 border-l-4 border-l-emerald-500">
          <p className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed italic">
            {question} <span className="text-emerald-600 dark:text-emerald-400">[{marks}]</span>
          </p>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-strong:text-slate-900 dark:prose-strong:text-slate-200 prose-headings:text-emerald-900 dark:prose-headings:text-emerald-400 prose-hr:border-slate-100 dark:prose-hr:border-slate-800" ref={contentRef}>
          <Markdown>{sanitizedContent}</Markdown>
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2.5 border-t border-emerald-100 dark:border-emerald-900/20 flex items-center gap-2 shrink-0">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
        <p className="text-[10px] font-medium text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
          AO1 Knowledge & AO2 Application Mapping Complete
        </p>
      </div>
    </motion.div>
  );
}
