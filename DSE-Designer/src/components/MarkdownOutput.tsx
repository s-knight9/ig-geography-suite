import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { FileDown, Check, Copy } from 'lucide-react';
import { marked } from 'marked';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Store map instances to capture them later
const mapInstances = new Map<HTMLElement, L.Map>();

const MapInstanceRegister = () => {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer().closest('.dse-map-container') as HTMLElement;
    if (container) {
      mapInstances.set(container, map);
    }
    return () => {
      if (container) mapInstances.delete(container);
    };
  }, [map]);
  return null;
};

interface MarkdownOutputProps {
  content: string;
  isGenerating: boolean;
}

export default function MarkdownOutput({ content, isGenerating }: MarkdownOutputProps) {
  const [copied, setCopied] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const captureMapImages = async () => {
    const leafletImage = (await import('leaflet-image')).default;
    const mapElements = document.querySelectorAll('.dse-map-container');
    const mapImages: string[] = [];
    
    for (let i = 0; i < mapElements.length; i++) {
      const el = mapElements[i] as HTMLElement;
      try {
        const map = mapInstances.get(el);
        if (map) {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            leafletImage(map, function(err: any, canvas: HTMLCanvasElement) {
                if (err) return reject(err);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            });
          });
          mapImages.push(dataUrl);
        } else {
          mapImages.push('');
        }
      } catch (e) {
        console.error('Failed to snapshot map', e);
        mapImages.push('');
      }
    }
    return mapImages;
  };
  const handleDownloadPdf = async () => {
    if (!content) return;
    setIsExporting(true);
    try {
      const html2pdfModule = (await import('html2pdf.js')) as any;
      const html2pdf = html2pdfModule.default || html2pdfModule;
      let parsedHtml = await marked.parse(content);
      
      const mapImages = await captureMapImages();
      let mapIndex = 0;
      parsedHtml = parsedHtml.replace(/<pre><code[^>]*language-json-map[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, jsonString) => {
        const src = mapImages[mapIndex++];
        if (src) {
          let title = "Geographical Context Map";
          try {
            const data = JSON.parse(jsonString.replace(/\n$/, ''));
            if (data.title) title = data.title;
          } catch (e) {}
          return `<div style="page-break-before: always; page-break-inside: avoid; break-inside: avoid; margin: 20px 0;"><h4 style="font-size: 14px; margin-bottom: 8px; font-family: sans-serif;">🗺️ ${title}</h4><img src="${src}" style="width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;" /></div>`;
        }
        return `<div style="page-break-before: always; page-break-inside: avoid; break-inside: avoid; padding: 20px; border: 1px solid #ccc; margin: 20px 0;">[Geographical Context Map could not be exported]</div>`;
      });
      
      const container = document.createElement('div');
      container.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 10px; color: #1e293b;">
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; margin-top: 10px;">
                <div style="background-color: #2563eb; color: white; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px;">IG</div>
                <div>
                   <div style="color: #2563eb; font-weight: 900; font-size: 20px; text-transform: uppercase;">0460 DSE Designer</div>
                   <div style="color: #94a3b8; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">IGCSE Geography Suite</div>
                </div>
            </div>
            <div style="line-height: 1.5; font-size: 14px;" class="markdown-body">
                ${parsedHtml}
            </div>
        </div>
      `;

      const h2Tags = container.querySelectorAll('h2');
      h2Tags.forEach(h2 => {
          if (h2.innerText.includes('Student DSE Input Report')) {
              h2.style.pageBreakBefore = 'always';
              h2.style.marginTop = '20px';
          }
      });
      
      const h1s = container.querySelectorAll('h1');
      h1s.forEach(h1 => { h1.style.color = '#1e293b'; h1.style.borderBottom = '2px solid #2563eb'; h1.style.paddingBottom = '4px'; h1.style.fontSize = '24px'; });

      const hrs = container.querySelectorAll('hr');
      hrs.forEach(hr => { 
        const div = document.createElement('div');
        div.style.marginTop = '24px'; 
        div.style.marginBottom = '24px'; 
        div.style.borderTop = '2px solid #e2e8f0';
        div.style.clear = 'both';
        div.style.width = '100%';
        hr.parentNode?.replaceChild(div, hr);
      });
      
      const paragraphs = container.querySelectorAll('p');
      paragraphs.forEach(p => {
         p.style.marginBottom = '16px';
      });

      const opt = {
        margin:       [15, 15, 15, 15] as [number, number, number, number],
        filename:     'DSE-Profile.pdf',
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true,
          onclone: (clonedDoc: Document) => {
            // SCRUB OKLCH: html2canvas kills the process if it sees oklch in ANY stylesheet
            const styles = clonedDoc.getElementsByTagName('style');
            for (let i = 0; i < styles.length; i++) {
              try {
                if (styles[i].innerHTML.includes('oklch')) {
                  styles[i].innerHTML = styles[i].innerHTML.replace(/oklch\([^)]+\)/g, '#4b5563');
                }
              } catch (e) {
                console.warn('Failed to scrub a style block', e);
              }
            }
            // Remove external links which might load oklch-heavy CSS (like Tailwind 4)
            const links = clonedDoc.getElementsByTagName('link');
            for (let i = links.length - 1; i >= 0; i--) {
              if (links[i].rel === 'stylesheet') {
                links[i].remove();
              }
            }
          }
        },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak:    { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt).from(container).save();
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!content) return;
    setIsExporting(true);
    try {
      const parsedHtml = await marked.parse(content);
      
      let headerHTML = `
          <div style="font-family: Arial, sans-serif;">
              <h2><span style="color: #2563eb;">IG 0460 DSE Designer</span></h2>
              <p><span style="color: #94a3b8;">IGCSE GEOGRAPHY SUITE</span></p>
              <hr style="color: #2563eb;"/>
          </div>
      `;
      
      let docxHtml = headerHTML + parsedHtml;
      docxHtml = docxHtml.replace(/<h2[^>]*>Student DSE Input Report/i, '<br clear="all" style="page-break-before:always" />$&');

      const mapImages = await captureMapImages();
      let mapIndex = 0;
      docxHtml = docxHtml.replace(/<pre><code[^>]*language-json-map[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, jsonString) => {
        const src = mapImages[mapIndex++];
        if (src) {
          let title = "Geographical Context Map";
          try {
            const data = JSON.parse(jsonString.replace(/\n$/, ''));
            if (data.title) title = data.title;
          } catch (e) {}
          return `<br clear="all" style="page-break-before:always" /><div style="margin: 20px 0;"><h4 style="font-size: 14px; margin-bottom: 8px;">🗺️ ${title}</h4><img src="${src}" style="width: 100%; max-width: 600px; border: 1px solid #ccc;" /></div>`;
        }
        return `<br clear="all" style="page-break-before:always" /><div style="padding: 20px; border: 1px solid #ccc;">[Geographical Context Map could not be exported]</div>`;
      });

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/dse/export-docx';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'html';
      input.value = docxHtml;
      
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (err) {
      console.error(err);
      alert('Failed to generate DOCX.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Header toolbar */}
      <div className="px-5 py-3 border-b border-slate-100 bg-white flex justify-between items-center shrink-0 rounded-t-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {isGenerating ? 'Synthesizing...' : content ? 'DSE Profile Data' : 'Output Target'}
          </div>
        </div>
        <div className="flex gap-2">
          {content && !isGenerating && (
            <>
              <button
                onClick={handleCopy}
                className="text-[10px] font-bold px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-1.5 transition-colors text-slate-600"
              >
                {copied ? <Check className="w-3 h-3 text-blue-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="text-[10px] font-bold px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-500 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
               >
                <FileDown className="w-3 h-3" />
                {isExporting ? 'Exporting...' : 'PDF'}
              </button>
              <button
                onClick={handleDownloadDocx}
                disabled={isExporting}
                className="text-[10px] font-bold px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
               >
                <FileDown className="w-3 h-3" />
                {isExporting ? 'Exporting...' : 'DOCX'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto text-slate-800 leading-relaxed bg-white">
        <div className="max-w-2xl mx-auto space-y-4 relative min-h-full">
          <AnimatePresence mode="wait">
            {isGenerating && !content && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center p-12"
              >
                <div className="flex flex-col items-center gap-4 text-slate-400">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-sm font-medium">Synthesizing geographical data...</p>
                </div>
              </motion.div>
            )}

            {!isGenerating && !content && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-12"
              >
                <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                  <FileDown className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">No Profile Generated</h4>
                <p className="text-center text-xs text-slate-400 max-w-xs">
                  Select a syllabus code on the left, provide some context or inputs, and click Generate.
                </p>
              </motion.div>
            )}

            {(content || isGenerating) && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`transition-opacity duration-300 ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="prose prose-sm md:prose-base prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h1:font-sans prose-h1:tracking-tight prose-h1:border-b-2 prose-h1:border-blue-500 prose-h1:pb-1 prose-h2:text-sm prose-h2:uppercase prose-h2:tracking-wider prose-h2:mt-6 prose-h2:text-slate-800 prose-h3:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-700">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-([\w-]+)/.exec(className || '');
                        if (!inline && match && match[1] === 'json-map') {
                          try {
                            const mapData = JSON.parse(String(children).replace(/\n$/, ''));
                            return (
                              <div className="dse-map-container my-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm not-prose" data-html2canvas-ignore="false">
                                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5">
                                  <h4 className="text-sm tracking-tight font-bold text-slate-700 m-0 flex items-center gap-2">
                                    🗺️ {mapData.title || "Geographical Context Map"}
                                  </h4>
                                </div>
                                <div className="h-[350px] w-full z-0 relative">
                                  <MapContainer center={mapData.center} zoom={mapData.zoom} scrollWheelZoom={false} preferCanvas={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                                    <MapInstanceRegister />
                                    <TileLayer
                                      attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                      crossOrigin="anonymous"
                                    />
                                    {mapData.markers?.map((m: any, i: number) => (
                                      <Marker key={i} position={m.position}>
                                        {m.popup && <Popup>{m.popup}</Popup>}
                                      </Marker>
                                    ))}
                                  </MapContainer>
                                </div>
                              </div>
                            );
                          } catch (err) {
                            console.error("Failed to parse map data", err);
                            return <code className={className} {...props}>{children}</code>;
                          }
                        }
                        return <code className={className} {...props}>{children}</code>;
                      }
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
