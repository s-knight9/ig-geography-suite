export interface RubricBand {
  level: number;
  marks: string;
  bgColor: string;
  bullets: string[];
}

export interface CriterionRubricData {
  criterionNumber: number;
  fullTitle: string;
  bands: RubricBand[];
}

export const IGQA_CRITERION_RUBRICS: Record<number, CriterionRubricData> = {
  1: {
    criterionNumber: 1,
    fullTitle: "Criterion 1: Knowledge and understanding (AO1)",
    bands: [
      {
        level: 3,
        marks: "9 to 12",
        bgColor: "#D9EAD3",
        bullets: [
          "Accurate use of a range of appropriate geographical terminology.",
          "Aims clearly related to relevant key geographical ideas.",
          "Geographical ideas are clearly linked to the study area.",
          "Comprehensive and relevant information provided using a range of secondary sources.",
          "Geographical ideas are consistently well applied throughout the study.",
          "Focuses on up to three hypotheses/guiding questions which are well justified with expected outcomes clearly stated."
        ]
      },
      {
        level: 2,
        marks: "5 to 8",
        bgColor: "#FFE599",
        bullets: [
          "Uses some appropriate geographical terminology.",
          "Develops a link between aims and geographical ideas.",
          "Some tentative links between geographical ideas and the study area.",
          "Relevant information provided or use of secondary source(s).",
          "Geographical ideas are applied but inconsistently.",
          "Some justification of hypothesis(ses)/guiding question(s) and some expected outcomes stated."
        ]
      },
      {
        level: 1,
        marks: "1 to 4",
        bgColor: "#F4CCCC",
        bullets: [
          "Shows a limited understanding of the aims.",
          "Geographical ideas may be partially linked to the study area.",
          "Describes information or uses secondary source(s) in simple geographical terms.",
          "Hypothesis(ses)/guiding question(s) stated with little or no justification or expected outcomes stated."
        ]
      },
      {
        level: 0,
        marks: "0",
        bgColor: "#EA9999",
        bullets: ["No creditable response."]
      }
    ]
  },
  2: {
    criterionNumber: 2,
    fullTitle: "Criterion 2: Observation and collection of data (AO2)",
    bands: [
      {
        level: 3,
        marks: "9 to 12",
        bgColor: "#D9EAD3",
        bullets: [
          "Collects and records detailed data from primary source(s).",
          "Demonstrates comprehensive and relevant planning.",
          "Detailed reference and justification of sampling strategy(ies) used."
        ]
      },
      {
        level: 2,
        marks: "5 to 8",
        bgColor: "#FFE599",
        bullets: [
          "Collects and records appropriate data from primary source(s).",
          "Some evidence of appropriate planning.",
          "Includes reference to sampling strategy(ies) used."
        ]
      },
      {
        level: 1,
        marks: "1 to 4",
        bgColor: "#F4CCCC",
        bullets: [
          "Collects and records basic information from primary source(s).",
          "Some evidence of simple planning.",
          "Limited or no evidence of an appropriate sampling strategy used."
        ]
      },
      {
        level: 0,
        marks: "0",
        bgColor: "#EA9999",
        bullets: ["No creditable response."]
      }
    ]
  },
  3: {
    criterionNumber: 3,
    fullTitle: "Criterion 3: Organisation and presentation of data (AO2)",
    bands: [
      {
        level: 3,
        marks: "9 to 12",
        bgColor: "#D9EAD3",
        bullets: [
          "A concise, well-balanced study following the route to geographical enquiry.",
          "Study is well ordered with a contents page, page numbers and clear headings.",
          "Includes tables of data relevant to the aims/hypotheses/guiding questions.",
          "Effective use of at least two appropriate complex data presentation techniques.",
          "Effective use of at least one relevant map."
        ]
      },
      {
        level: 2,
        marks: "5 to 8",
        bgColor: "#FFE599",
        bullets: [
          "The study is logically ordered following the route to geographical enquiry.",
          "Includes some appropriate tables of data.",
          "Effective use of two or more simple data presentation techniques.",
          "Includes one relevant map."
        ]
      },
      {
        level: 1,
        marks: "1 to 4",
        bgColor: "#F4CCCC",
        bullets: [
          "The study has some structure and may follow some of the stages of the route to geographical enquiry.",
          "Includes one or two simple tables of data.",
          "Uses one simple data presentation technique."
        ]
      },
      {
        level: 0,
        marks: "0",
        bgColor: "#EA9999",
        bullets: ["No creditable response."]
      }
    ]
  },
  4: {
    criterionNumber: 4,
    fullTitle: "Criterion 4: Analysis and interpretation (AO2)",
    bands: [
      {
        level: 3,
        marks: "9 to 12",
        bgColor: "#D9EAD3",
        bullets: [
          "Thorough and relevant analysis and interpretation of the data.",
          "Clearly identifies both trends and anomalies and could include correctly interpreted results of statistical testing.",
          "Provides reasoned explanations of the data collected clearly based on geographical theory or identified characteristics of the study area."
        ]
      },
      {
        level: 2,
        marks: "5 to 8",
        bgColor: "#FFE599",
        bullets: [
          "Some appropriate analysis and interpretation of the data.",
          "Some identification of simple trends which may include anomalies.",
          "Provides some appropriate explanations of the data collected with reference to geographical theory or identified characteristics of the study area."
        ]
      },
      {
        level: 1,
        marks: "1 to 4",
        bgColor: "#F4CCCC",
        bullets: [
          "Makes simple or descriptive statements about the data collected."
        ]
      },
      {
        level: 0,
        marks: "0",
        bgColor: "#EA9999",
        bullets: ["No creditable response."]
      }
    ]
  },
  5: {
    criterionNumber: 5,
    fullTitle: "Criterion 5: Conclusion: Evaluation and decision-making (AO3)",
    bands: [
      {
        level: 3,
        marks: "9 to 12",
        bgColor: "#D9EAD3",
        bullets: [
          "States clear conclusions which are directly linked to the aims and hypotheses/guiding questions.",
          "Conclusions are supported by key primary quantitative and/or qualitative data or through specific reference(s) to figures such as graphs, maps or photographs.",
          "Conclusions are directly linked to relevant geographical theory or specific characteristics of the study area.",
          "Clear evaluation, identifying strengths and weaknesses of the study, including specific justified suggestions of how weaknesses could be overcome.",
          "Suggests some ideas for further study."
        ]
      },
      {
        level: 2,
        marks: "5 to 8",
        bgColor: "#FFE599",
        bullets: [
          "States some appropriate conclusions with links to the aims/hypothesis(ses)/guiding question(s).",
          "Conclusions are supported by reference to data collected or some explanation of the findings.",
          "Some evaluation of a limited range of strengths and/or weaknesses, with some simple suggestions of how weaknesses could be overcome."
        ]
      },
      {
        level: 1,
        marks: "1 to 4",
        bgColor: "#F4CCCC",
        bullets: [
          "States simple and unsupported conclusion(s) with minimal links to aims/hypothesis(ses)/guiding question(s).",
          "Simple evaluative statements which show limited awareness of strengths and/or weaknesses of the study."
        ]
      },
      {
        level: 0,
        marks: "0",
        bgColor: "#EA9999",
        bullets: ["No creditable response."]
      }
    ]
  }
};
