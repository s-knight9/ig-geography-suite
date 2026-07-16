import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const exportDashboardToPDF = async (containerId: string, fileName: string) => {
  const element = document.getElementById(containerId);
  if (!element) return;

  // Add a class temporarily to adjust things for PDF
  document.body.classList.add('pdf-export-mode');
  
  // Wait a tick for styles to apply
  await new Promise(r => setTimeout(r, 100));

  try {
    const width = element.offsetWidth;
    // Get master snapshot
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 1.5, // Crisp resolution
      backgroundColor: '#f8fafc' // Slate 50
    });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    const A4_WIDTH_PT = 841.89;
    const A4_HEIGHT_PT = 595.28;
    
    const marginPt = 20; // 20pt margin
    const usableWidthPt = A4_WIDTH_PT - (marginPt * 2);
    const usableHeightPt = A4_HEIGHT_PT - (marginPt * 2);

    // Image aspect ratio
    const imgProp = pdf.getImageProperties(dataUrl);
    // Since pixelRatio is 1.5, the image is wider than DOM width
    // But we map DOM Width to Usable Width Pt
    
    // Calculate the DOM height equivalent to one PDF page
    const scaleFactor = usableWidthPt / width; // pt per dom pixel
    const pageHeightDom = usableHeightPt / scaleFactor;

    // Get all avoid-break elements
    const avoidBreakEls = Array.from(element.querySelectorAll('.print-avoid-break, .bg-white.rounded-2xl, .bg-white.rounded-xl'));
    const containerRect = element.getBoundingClientRect();
    
    // Build a map of their vertical spans relative to the container
    const breaks = avoidBreakEls.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top - containerRect.top,
        bottom: rect.bottom - containerRect.top
      };
    });

    const totalHeightDom = element.offsetHeight;
    let currentY = 0;
    
    const img = new Image();
    img.src = dataUrl;
    await new Promise(r => { img.onload = r; });

    let isFirstPage = true;

    while (currentY < totalHeightDom) {
      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      let proposedYEnd = currentY + pageHeightDom;

      if (proposedYEnd < totalHeightDom) {
        // Find if we cut through an element
        // An element is cut if its top < proposedYEnd AND its bottom > proposedYEnd
        const intersecting = breaks.find(b => b.top < proposedYEnd && b.bottom > proposedYEnd);
        
        if (intersecting) {
          // Instead, cut right above this element
          // unless the element itself is huge and starts exactly at currentY (or before)
          if (intersecting.top > currentY + 50) { 
            proposedYEnd = intersecting.top - 10; // 10px buffer
          }
        }
      } else {
        proposedYEnd = totalHeightDom;
      }

      const chunkHeightDom = proposedYEnd - currentY;
      const chunkHeightPt = chunkHeightDom * scaleFactor;

      const chunkCanvas = document.createElement('canvas');
      chunkCanvas.width = imgProp.width;
      chunkCanvas.height = chunkHeightDom * 1.5; // pixel ratio 1.5
      
      const ctx = chunkCanvas.getContext('2d');
      if (ctx) {
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        ctx.drawImage(
          img,
          0, currentY * 1.5, imgProp.width, chunkHeightDom * 1.5,
          0, 0, imgProp.width, chunkHeightDom * 1.5
        );
        
        const chunkDataUrl = chunkCanvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(chunkDataUrl, 'JPEG', marginPt, marginPt, usableWidthPt, chunkHeightPt);
      }
      
      currentY = proposedYEnd;
    }

    pdf.save(fileName);
  } finally {
    document.body.classList.remove('pdf-export-mode');
  }
};
