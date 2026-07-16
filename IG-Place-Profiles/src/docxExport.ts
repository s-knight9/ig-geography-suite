import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  VerticalAlign,
} from "docx";
import type { DPPlaceProfile } from "./types";

// Helper for standard spacing and margins
const fontStack = "Arial";

const heading1Color = "4F46E5"; // Indigo 600
const heading2Color = "1E293B"; // Slate 800
const textColor = "334155"; // Slate 700
const lightShading = "F8FAFC"; // Slate 50
const accentBorder = "CBD5E1"; // Slate 300

function buildHeading1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        font: fontStack,
        bold: true,
        size: 32, // 16pt
        color: heading1Color,
      }),
    ],
  });
}

function buildHeading2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text,
        font: fontStack,
        bold: true,
        size: 26, // 13pt
        color: heading2Color,
      }),
    ],
  });
}

function buildParagraph(text: string, isItalic = false): Paragraph {
  return new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({
        text,
        font: fontStack,
        italics: isItalic,
        size: 22, // 11pt
        color: textColor,
      }),
    ],
  });
}

function buildBulletPoint(boldPrefix: string, text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 80 },
    children: [
      new TextRun({
        text: boldPrefix,
        font: fontStack,
        bold: true,
        size: 22,
        color: heading2Color,
      }),
      new TextRun({
        text,
        font: fontStack,
        size: 22,
        color: textColor,
      }),
    ],
  });
}

function buildTableCell(
  content: string | Paragraph[],
  widthPercent: number,
  isHeader = false,
  shadingColor?: string
): TableCell {
  const paragraphs = typeof content === "string" 
    ? [
        new Paragraph({
          children: [
            new TextRun({
              text: content,
              font: fontStack,
              bold: isHeader,
              size: 20, // 10pt
              color: isHeader ? "FFFFFF" : textColor,
            }),
          ],
        }),
      ]
    : content;

  return new TableCell({
    children: paragraphs,
    width: {
      size: widthPercent,
      type: WidthType.PERCENTAGE,
    },
    verticalAlign: VerticalAlign.CENTER,
    shading: isHeader
      ? { fill: heading1Color }
      : shadingColor ? { fill: shadingColor } : undefined,
    margins: {
      top: 140, // comfortable padding
      bottom: 140,
      left: 180,
      right: 180,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: accentBorder },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: accentBorder },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
  });
}

export const exportDashboardToDocx = async (
  countryA: DPPlaceProfile,
  countryB: DPPlaceProfile,
  narrativeText?: string
) => {
  const nameA = countryA.country_metadata.name;
  const nameB = countryB.country_metadata.name;

  // Let's gather development indices
  const hdiA = countryA.country_metadata.hdi.score?.toFixed(3) || "N/A";
  const hdiB = countryB.country_metadata.hdi.score?.toFixed(3) || "N/A";
  const rankA = countryA.country_metadata.hdi.rank || "N/A";
  const rankB = countryB.country_metadata.hdi.rank || "N/A";
  const gniA = countryA.country_metadata.gni_per_capita_atlas.value_usd.toLocaleString() || "N/A";
  const gniB = countryB.country_metadata.gni_per_capita_atlas.value_usd.toLocaleString() || "N/A";
  const giniA = countryA.country_metadata.gini_coefficient?.score?.toFixed(1) || "N/A";
  const giniB = countryB.country_metadata.gini_coefficient?.score?.toFixed(1) || "N/A";

  const keyDevelopmentTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      // Header
      new TableRow({
        children: [
          buildTableCell("Development Indicator", 40, true),
          buildTableCell(nameA, 30, true),
          buildTableCell(nameB, 30, true),
        ],
      }),
      // Row 1
      new TableRow({
        children: [
          buildTableCell("Human Development Index (HDI) Score", 40, false, "FFFFFF"),
          buildTableCell(hdiA, 30, false, "FFFFFF"),
          buildTableCell(hdiB, 30, false, "FFFFFF"),
        ],
      }),
      // Row 2
      new TableRow({
        children: [
          buildTableCell("HDI Global Rank", 40, false, lightShading),
          buildTableCell(`#${rankA}`, 30, false, lightShading),
          buildTableCell(`#${rankB}`, 30, false, lightShading),
        ],
      }),
      // Row 3
      new TableRow({
        children: [
          buildTableCell("GNI per Capita (Atlas Method USD)", 40, false, "FFFFFF"),
          buildTableCell(`$${gniA}`, 30, false, "FFFFFF"),
          buildTableCell(`$${gniB}`, 30, false, "FFFFFF"),
        ],
      }),
      // Row 4
      new TableRow({
        children: [
          buildTableCell("Gini Coefficient (Income Inequality)", 40, false, lightShading),
          buildTableCell(giniA, 30, false, lightShading),
          buildTableCell(giniB, 30, false, lightShading),
        ],
      }),
      // Row 5
      new TableRow({
        children: [
          buildTableCell("Income Standard Classification", 40, false, "FFFFFF"),
          buildTableCell(countryA.country_metadata.income_classification || "N/A", 30, false, "FFFFFF"),
          buildTableCell(countryB.country_metadata.income_classification || "N/A", 30, false, "FFFFFF"),
        ],
      }),
    ],
  });

  // Employment Sectors comparison table
  const empA = countryA.economy_tab.employment_structure;
  const empB = countryB.economy_tab.employment_structure;
  const sectorTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          buildTableCell("Economic Sector", 40, true),
          buildTableCell(`${nameA} (% workforce)`, 30, true),
          buildTableCell(`${nameB} (% workforce)`, 30, true),
        ],
      }),
      new TableRow({
        children: [
          buildTableCell("Primary Sector (Agriculture/Mining)", 40, false, "FFFFFF"),
          buildTableCell(`${empA.primary}%`, 30, false, "FFFFFF"),
          buildTableCell(`${empB.primary}%`, 30, false, "FFFFFF"),
        ],
      }),
      new TableRow({
        children: [
          buildTableCell("Secondary Sector (Manufacturing/Construction)", 40, false, lightShading),
          buildTableCell(`${empA.secondary}%`, 30, false, lightShading),
          buildTableCell(`${empB.secondary}%`, 30, false, lightShading),
        ],
      }),
      new TableRow({
        children: [
          buildTableCell("Tertiary Sector (Services/Retail)", 40, false, "FFFFFF"),
          buildTableCell(`${empA.tertiary}%`, 30, false, "FFFFFF"),
          buildTableCell(`${empB.tertiary}%`, 30, false, "FFFFFF"),
        ],
      }),
      new TableRow({
        children: [
          buildTableCell("Quaternary Sector (Knowledge-based/R&D)", 40, false, lightShading),
          buildTableCell(`${empA.quaternary}%`, 30, false, lightShading),
          buildTableCell(`${empB.quaternary}%`, 30, false, lightShading),
        ],
      }),
    ],
  });

  // Set up the body sections array
  const docSections = [];

  // Title section elements
  const titleElements: any[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 120 },
      children: [
        new TextRun({
          text: "DP GEOGRAPHY PLACE PROFILES",
          font: fontStack,
          bold: true,
          size: 38, // 19pt
          color: heading1Color,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 300 },
      children: [
        new TextRun({
          text: `Comparative Academic Case Study: ${nameA} vs ${nameB}`,
          font: fontStack,
          bold: true,
          size: 26, // 13pt
          color: "475569", // Slate 600
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 400 },
      children: [
        new TextRun({
          text: "Prepared for NLCS Geography Dept // Class Case Study",
          font: fontStack,
          italics: true,
          size: 18, // 9pt
          color: "94A3B8", // Slate 400
        }),
      ],
    }),

    buildHeading1("1. Key Development Profile"),
    buildParagraph(
      `This section establishes the core demographic and economic baseline indicators for ${nameA} and ${nameB} according to the latest spatial indices. Developing a quantitative case-study background is a critical requirement of the IB Diploma DP Geography syllabus.`,
      true
    ),
    keyDevelopmentTable,
    new Paragraph({ spacing: { after: 200 } }), // buffer layout
  ];

  // Optional synthesised AI narrative
  if (narrativeText) {
    titleElements.push(buildHeading1("2. Comparative Divergence / Convergence Analysis"));
    titleElements.push(
      buildParagraph(
        "The following multi-dimensional analysis examines the development inequalities, structural employment gaps, and geographical advantages between the two selected territories:",
        true
      )
    );

    const paragraphs = narrativeText.split("\n");
    paragraphs.forEach((p) => {
      const trimmed = p.trim();
      if (trimmed) {
        titleElements.push(buildParagraph(trimmed));
      }
    });
    titleElements.push(new Paragraph({ spacing: { after: 150 } }));
  }

  // Segment 3: Economic Profiles
  titleElements.push(buildHeading1("3. Sectoral Economic Models"));
  titleElements.push(
    buildParagraph(
      `The distribution of active workforces across the four primary sectors represents the developmental stage of a country's economic core. Under physical and human geography interactions, transitions of labor are indicative of urbanisation or de-industrialisation patterns.`
    )
  );
  titleElements.push(sectorTable);
  titleElements.push(new Paragraph({ spacing: { before: 180, after: 120 } }));

  // Exports/Imports details
  titleElements.push(buildHeading2(`${nameA} Trade Balance & Core Ledger`));
  const exportsA = countryA.economy_tab.trade_ledger.main_exports || [];
  const importsA = countryA.economy_tab.trade_ledger.main_imports || [];
  if (exportsA.length > 0) {
    titleElements.push(buildBulletPoint("Primary Commodities Sold: ", exportsA.map(e => `${e.commodity} (${e.pct_gdp}% GDP equivalent)`).join(", ")));
  }
  if (importsA.length > 0) {
    titleElements.push(buildBulletPoint("Primary Commodities Imported: ", importsA.map(i => `${i.commodity} (${i.pct_gdp}% GDP equivalent)`).join(", ")));
  }

  titleElements.push(buildHeading2(`${nameB} Trade Balance & Core Ledger`));
  const exportsB = countryB.economy_tab.trade_ledger.main_exports || [];
  const importsB = countryB.economy_tab.trade_ledger.main_imports || [];
  if (exportsB.length > 0) {
    titleElements.push(buildBulletPoint("Primary Commodities Sold: ", exportsB.map(e => `${e.commodity} (${e.pct_gdp}% GDP equivalent)`).join(", ")));
  }
  if (importsB.length > 0) {
    titleElements.push(buildBulletPoint("Primary Commodities Imported: ", importsB.map(i => `${i.commodity} (${i.pct_gdp}% GDP equivalent)`).join(", ")));
  }

  titleElements.push(new Paragraph({ spacing: { after: 200 } }));

  // Segment 4: Physical Geography & Constraints (Prisoners of Geography)
  titleElements.push(buildHeading1("4. Geopolitical & Geophysical Constraints"));
  titleElements.push(
    buildParagraph(
      "Both countries are bound by physical limitations—such as relief friction, water availability, transboundary pathways, and tactical corridors—which shapes their human development potential:"
    )
  );

  titleElements.push(buildHeading2(`${nameA} - Physical Layer Analysis`));
  const frictionA = countryA.prisoners_of_geography_map.topographic_friction_points || [];
  frictionA.forEach(f => {
    titleElements.push(buildBulletPoint(`${f.feature}: `, f.geopolitical_constraint));
  });
  const arteriesA = countryA.prisoners_of_geography_map.hydrological_arteries || [];
  arteriesA.forEach(a => {
    titleElements.push(buildBulletPoint(`${a.feature} (Hydrological): `, a.strategic_advantage));
  });

  titleElements.push(buildHeading2(`${nameB} - Physical Layer Analysis`));
  const frictionB = countryB.prisoners_of_geography_map.topographic_friction_points || [];
  frictionB.forEach(f => {
    titleElements.push(buildBulletPoint(`${f.feature}: `, f.geopolitical_constraint));
  });
  const arteriesB = countryB.prisoners_of_geography_map.hydrological_arteries || [];
  arteriesB.forEach(a => {
    titleElements.push(buildBulletPoint(`${a.feature} (Hydrological): `, a.strategic_advantage));
  });

  titleElements.push(new Paragraph({ spacing: { after: 200 } }));

  // Segment 5: Global Governance & Risks
  titleElements.push(buildHeading1("5. Governance, Risks & Globalisation Status"));
  titleElements.push(
    buildParagraph(
      "Spatial flows of capital, people, culture, and services require functional political governance and stable regulatory structures. Below is a comparative snapshot of regulatory stability."
    )
  );

  titleElements.push(buildHeading2(`${nameA} Institutional Infrastructure`));
  titleElements.push(buildBulletPoint("EIU Governance Type: ", countryA.human_geography_tab.political_economy?.eiu_governance_type || "N/A"));
  titleElements.push(buildBulletPoint("Freedom House Index: ", countryA.human_geography_tab.political_economy?.freedom_house_status || "N/A"));
  titleElements.push(buildBulletPoint("Corruption Perception Index Rank: ", `#${countryA.human_geography_tab.political_economy?.corruption_perceptions_index?.rank || "N/A"}`));

  titleElements.push(buildHeading2(`${nameB} Institutional Infrastructure`));
  titleElements.push(buildBulletPoint("EIU Governance Type: ", countryB.human_geography_tab.political_economy?.eiu_governance_type || "N/A"));
  titleElements.push(buildBulletPoint("Freedom House Index: ", countryB.human_geography_tab.political_economy?.freedom_house_status || "N/A"));
  titleElements.push(buildBulletPoint("Corruption Perception Index Rank: ", `#${countryB.human_geography_tab.political_economy?.corruption_perceptions_index?.rank || "N/A"}`));

  // Document configuration
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: titleElements,
      },
    ],
  });

  // Packing and file download
  const blob = await Packer.toBlob(doc);
  const downloadUrl = window.URL.createObjectURL(blob);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.href = downloadUrl;
  downloadAnchor.download = `DP_Place_Profiles_Comparison_${nameA}_vs_${nameB}.docx`;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  window.URL.revokeObjectURL(downloadUrl);
};
