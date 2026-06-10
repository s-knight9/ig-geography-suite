import pptxgen from "pptxgenjs";

interface SlideData {
  title: string;
  bullets: string[];
  speaker_notes?: string;
}

export async function generateClassFeedbackPPTX(students: any[], className: string, assignmentName: string) {
  // Extract relevant evaluation data for prompt
  const evaluations = students.map(s => ({
    name: s.candidateName,
    draftEvaluation: s.draftEvaluation,
    finalEvaluation: s.finalEvaluation // Some may not have final yet
  }));

  const response = await fetch("/api/generate-class-feedback-content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ evaluations }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to generate class feedback");
  }

  const { slides } = await response.json();

  if (!slides || !Array.isArray(slides)) {
    throw new Error("Invalid response format from server");
  }

  const pres = new pptxgen();

  pres.author = "IGCSE Geography Moderator";
  pres.company = "IGCWK QA";
  pres.title = `Class Feedback - ${className} - ${assignmentName}`;
  
  // Title Slide
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: "1E293B" }; // slate-800
  titleSlide.addText("IGCSE Geography (0460)", {
    x: "10%",
    y: "30%",
    w: "80%",
    h: 1,
    fontSize: 24,
    color: "94A3B8", // slate-400
    align: "center",
  });
  titleSlide.addText("Comprehensive Whole-Class Feedback", {
    x: "10%",
    y: "40%",
    w: "80%",
    h: 1.5,
    fontSize: 36,
    color: "FFFFFF",
    bold: true,
    align: "center",
  });
  titleSlide.addText(`Class: ${className}\nAssignment: ${assignmentName}`, {
    x: "10%",
    y: "65%",
    w: "80%",
    h: 1,
    fontSize: 18,
    color: "cbd5e1", // slate-300
    align: "center",
  });
  
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  titleSlide.addText(today, {
      x: "10%",
      y: "85%",
      w: "80%",
      fontSize: 12,
      color: "64748B", // slate-500
      align: "center",
  });

  // Content Slides
  slides.forEach((slideData: SlideData) => {
    const slide = pres.addSlide();
    slide.background = { color: "FFFFFF" };

    // Header strip
    slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.8, fill: { color: "2563EB" } }); // blue-600

    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.1,
      w: "90%",
      h: 0.6,
      fontSize: 24,
      color: "FFFFFF",
      bold: true,
      valign: "middle"
    });

    const bulletOptions: any = {
      x: 0.5,
      y: 1.2,
      w: "90%",
      h: 4.0,
      fontSize: 16,
      color: "1E293B", // slate-800
      bullet: true,
      margin: 10,
      fontFace: "Arial",
      valign: "top",
      lineSpacing: 24,
      breakLine: true
    };

    slide.addText(slideData.bullets.join("\n"), bulletOptions);

    if (slideData.speaker_notes) {
      slide.addNotes(slideData.speaker_notes);
    }
  });

  await pres.writeFile({ fileName: `Class_Feedback_${className.replace(/\s+/g, '_')}_${assignmentName.replace(/\s+/g, '_')}.pptx` });
}
