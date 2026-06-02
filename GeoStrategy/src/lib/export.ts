import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { EssayInput } from "./gemini";

/**
 * Very basic Markdown to Paragraph converter for the essay plan.
 * Handles headers (starting with # or **) and bullet points.
 */
export async function downloadAsDocx(markdown: string, input: EssayInput) {
  const lines = markdown.split("\n");
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: "Essay Plan: " + input.question,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Headers (starting with #)
    if (trimmed.startsWith("#")) {
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const text = trimmed.replace(/^#+\s*/, "");
      children.push(
        new Paragraph({
          text,
          heading: level === 1 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
        })
      );
    } 
    // Bold lines used as headers (common in AI output)
    else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      const text = trimmed.replace(/\*\*/g, "");
      children.push(
        new Paragraph({
          text,
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 200, after: 100 },
        })
      );
    }
    // Bullet points
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.replace(/^[-*]\s*/, "");
      children.push(
        new Paragraph({
          text,
          bullet: { level: 0 },
          spacing: { after: 120 },
        })
      );
    }
    // Normal text
    else {
      // Handle inline bold briefly
      const parts = trimmed.split(/(\*\*.*?\*\*)/);
      const runs = parts.map(part => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return new TextRun({
            text: part.replace(/\*\*/g, ""),
            bold: true,
          });
        }
        return new TextRun(part);
      });

      children.push(
        new Paragraph({
          children: runs,
          spacing: { after: 120 },
        })
      );
    }
  }

  // Add Student Planning Summary
  children.push(
    new Paragraph({
      text: "Student Planning Summary",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  const addInputRow = (label: string, value: string | string[]) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: label + ": ", bold: true }),
          new TextRun(Array.isArray(value) ? value.join(", ") : value),
        ],
        spacing: { after: 120 },
      })
    );
  };

  addInputRow("Question", input.question);
  addInputRow("Marks", input.marks);
  addInputRow("Key Terms", input.keyTerms);
  addInputRow("Paragraph focuses", input.paragraphFocuses);
  addInputRow("Conceptual Pillars", input.conceptualPillars);
  addInputRow("Additional Concepts", input.concepts);
  addInputRow("Structure", input.structure);
  addInputRow("Conclusion Stance", input.conclusionStance);

  if (input.sources.length > 0) {
    children.push(
      new Paragraph({
        text: "Sources & Context",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      })
    );
    input.sources.forEach((source, index) => {
      if (source.url) {
        addInputRow(`Source ${index + 1} (URL)`, source.url);
      }
      if (source.file) {
        addInputRow(`Source ${index + 1} (File)`, `${source.file.name} (Type: ${source.file.type || 'N/A'})`);
      }
      if (source.synopsis) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "   Synopsis: ", bold: true, size: 18 }),
              new TextRun({ text: source.synopsis, size: 18, italics: true }),
            ],
            spacing: { after: 120 },
            indent: { left: 720 },
          })
        );
      }
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Essay_Plan_${input.question.substring(0, 30).replace(/[^a-z0-9]/gi, "_")}.docx`);
}
