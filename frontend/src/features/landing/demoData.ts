export type DemoView = "upload" | "preview" | "schema" | "insight";
export const demoRows = [
  ["1001", "Online", "128.00"],
  ["1002", "Retail", "86.50"],
  ["1003", "Online", "249.00"],
  ["1004", "Wholesale", "480.00"],
  ["1005", "Retail", "64.00"],
  ["1006", "Online", "172.50"],
];
export const demoSchema = [
  ["order_id", "integer"],
  ["date", "text"],
  ["channel", "text"],
  ["revenue", "real"],
];
export const demoInsight = {
  summary: "Six orders across three sales channels.",
  points: [
    "Four fields describe each order.",
    "Revenue is numeric; channel is categorical.",
    "No empty fields in the sample.",
  ],
  context:
    "Six example orders. Identify the fields and check for missing values.",
};
export const workflowSteps = [
  {
    label: "Upload",
    number: "01 / UPLOAD",
    title: "A home for your files.",
    description:
      "Add a CSV or SQLite file. Find it in your dataset library and open it to explore its tables.",
    detail: "CSV · SQLite",
    view: "upload",
  },
  {
    label: "Schema",
    number: "02 / INSPECT",
    title: "Know what’s in each column.",
    description:
      "Select a table and review its column names and types. Understand the structure before analyzing the data.",
    detail: "Tables · Columns · Types",
    view: "schema",
  },
  {
    label: "Initial insight",
    number: "03 / UNDERSTAND",
    title: "Start with an initial insight.",
    description:
      "Add context about your dataset, then run an insight to identify a useful starting point for exploration.",
    detail:
      "Available on supported datasets; .sqlite insights are currently excluded.",
    view: "insight",
  },
] satisfies {
  label: string;
  number: string;
  title: string;
  description: string;
  detail: string;
  view: DemoView;
}[];
export const faqItems = [
  [
    "Which files can I upload?",
    "The app accepts .csv, .db, and .sqlite datasets. Select a table to inspect its column names and types.",
  ],
  [
    "What does an initial insight do?",
    "It uses the selected table and any context you provide to generate an initial analysis. It is a starting point for exploration; review its conclusions against your data.",
  ],
  [
    "Can I run insights on every file?",
    "Initial insights are available for CSV and .db datasets. Files with the .sqlite extension support schema inspection, but initial insights are currently unavailable.",
  ],
  [
    "Is this a live analysis?",
    "This landing-page walkthrough uses sample data and illustrative output. No file is sent to a backend and no AI request is made here. Get Started opens the real application.",
  ],
];
