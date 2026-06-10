import { ElementData, PageData } from './types';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function exportToPdf(pages: PageData[]): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });
  
  for (let i = 0; i < pages.length; i++) {
    if (i > 0) doc.addPage();
    const page = pages[i];
    
    const canvas = document.createElement('canvas');
    // For 300 DPI A3
    const DPI = 300;
    canvas.width = (42 / 2.54) * DPI;
    canvas.height = (29.7 / 2.54) * DPI;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    
    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw elements
    for (const el of page.elements) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for export'));
        img.src = el.src;
      });
      
      const cmToPx = canvas.width / 42; 
      const x_px = el.x * cmToPx;
      const y_px = el.y * cmToPx;
      const w_px = el.width * cmToPx;
      const h_px = el.height * cmToPx;
      
      const crop = el.crop || { t: 0, r: 0, b: 0, l: 0 };
      const ct_px = crop.t * cmToPx;
      const cr_px = crop.r * cmToPx;
      const cb_px = crop.b * cmToPx;
      const cl_px = crop.l * cmToPx;
      
      ctx.save();
      ctx.translate(x_px + w_px / 2, y_px + h_px / 2);
      ctx.rotate((el.rotation * Math.PI) / 180);
      
      ctx.beginPath();
      ctx.rect(-w_px / 2 + cl_px, -h_px / 2 + ct_px, w_px - cl_px - cr_px, h_px - ct_px - cb_px);
      ctx.clip();
      
      ctx.drawImage(img, -w_px / 2, -h_px / 2, w_px, h_px);
      ctx.restore();
    }
    
    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 420, 297);
  }
  
  doc.save('IGCSE_OS_Map_Maker.pdf');
}

export async function convertPdfToImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  // Use a high scale for better resolution (e.g. 300 DPI approx)
  const viewport = page.getViewport({ scale: 4.0 });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get canvas context');
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  // @ts-ignore
  await page.render({ canvasContext: ctx, viewport }).promise;
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(URL.createObjectURL(blob));
      else reject(new Error('Failed to create blob from canvas'));
    }, 'image/png');
  });
}

export function extractCrop(
  element: ElementData, 
  cropRectCm: { x: number, y: number, w: number, h: number }
): Promise<{ url: string, nativeW: number, nativeH: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate how many native pixels represent 1 cm based on the element's current width
      const scaleNativePerCm = element.nativeWidth / element.width;
      
      const cropW_px = cropRectCm.w * scaleNativePerCm;
      const cropH_px = cropRectCm.h * scaleNativePerCm;
      
      const cropX_relative_cm = cropRectCm.x - element.x;
      const cropY_relative_cm = cropRectCm.y - element.y;
      
      const cropX_px = cropX_relative_cm * scaleNativePerCm;
      const cropY_px = cropY_relative_cm * scaleNativePerCm;

      const canvas = document.createElement('canvas');
      canvas.width = cropW_px;
      canvas.height = cropH_px;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');

      // First shift over so that the cropped region's top-left sits at 0,0 on the canvas
      ctx.translate(-cropX_px, -cropY_px);
      
      // Calculate rotation center relative to the top-left of the unrotated element
      // For standard CSS transform: rotate(), the origin is the center of the bounding box.
      const centerOffsetX = element.width * scaleNativePerCm / 2;
      const centerOffsetY = element.height * scaleNativePerCm / 2;
      
      ctx.translate(centerOffsetX, centerOffsetY);
      ctx.rotate((element.rotation * Math.PI) / 180);
      
      // Draw image shifted by half width/height so it revolves around the mapped center
      ctx.drawImage(img, -centerOffsetX, -centerOffsetY, element.nativeWidth, element.nativeHeight);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve({ 
            url: URL.createObjectURL(blob), 
            nativeW: cropW_px, 
            nativeH: cropH_px 
          });
        } else {
          reject('Blob generation failed');
        }
      }, 'image/png');
    };
    img.onerror = () => reject('Image load failed');
    img.src = element.src;
  });
}
