export type ExperienceType = "work" | "project";

export interface SkillWeight {
  skill: string;
  intensity: number; // 1-5, how central this skill was to the entry
}

export interface ExperienceEntry {
  id: string;
  title: string;
  org?: string;
  type: ExperienceType;
  startDate: string; // "YYYY-MM"
  endDate: string | "present";
  bullets: string[];
  skills: SkillWeight[];
  url?: string;
}

export const experienceEntries: ExperienceEntry[] = [
  {
    id: "regeneron",
    title: "AI/ML Engineering Intern",
    org: "Regeneron Pharmaceuticals, Inc.",
    type: "work",
    startDate: "2026-05",
    endDate: "2026-08",
    bullets: [
      "Built a platform on AWS to monitor the health of 30+ production AI models in one place, adopted by 3 pilot teams and shaped by 13 stakeholder interviews.",
      "Built ML-based drift detection that alerts teams when live data diverges from what a model was trained on, using a Random Forest classifier two-sample test.",
      "Tracked how data subgroups shift over time to help pinpoint the cause, using Gaussian mixture models, BIC model selection, and cost matching.",
      "Created a dashboard (React, visx, FastAPI) giving teams a single view of model performance, data drift, and benchmark results.",
      "Cut LLM evaluation costs by over 60% at equal confidence by tailoring questions to each model's past answers.",
      "Wrote an environment-agnostic Python SDK so teams can send data and run model analysis from wherever their models live.",
    ],
    skills: [
      { skill: "AWS", intensity: 5 },
      { skill: "Python", intensity: 5 },
      { skill: "MLOps", intensity: 4 },
      { skill: "LLM Evaluation", intensity: 5 },
      { skill: "Unsupervised ML", intensity: 3 },
      { skill: "ML/scikit-learn", intensity: 4 },
      { skill: "Pandas", intensity: 3 },
      { skill: "SQL", intensity: 3 },
      { skill: "PostgreSQL", intensity: 3 },
      { skill: "React", intensity: 3 },
      { skill: "JS/TS", intensity: 3 },
      { skill: "visx", intensity: 3 },
      { skill: "FastAPI", intensity: 3 },
      { skill: "Docker", intensity: 3 },
      { skill: "Figma", intensity: 3 },
      { skill: "Async/SDK Design", intensity: 4 },
    ],
  },
  {
    id: "lspe",
    title: "Web Development Lab Assistant",
    org: "Laboratory of Spaceflight and Planetary Exploration (LSPE), WPI",
    type: "work",
    startDate: "2024-08",
    endDate: "present",
    bullets: [
      "Under contract with NASA JPL, built a mission planning web app for exploring interplanetary trajectories.",
      "Let mission planners filter millions of trajectories interactively by optimizing the database and graphs, migrating from SQLite to DuckDB over hive-partitioned Parquet with client-side OPFS caching.",
      "Led development of an interactive, 3D Mars lander simulation with Three.js.",
      "Built a robust CI/CD pipeline for the lab with Docker, unit testing, linting, and GitHub Actions.",
    ],
    skills: [
      { skill: "React", intensity: 4 },
      { skill: "JS/TS", intensity: 4 },
      { skill: "Three.js", intensity: 4 },
      { skill: "Plotly Dash", intensity: 4 },
      { skill: "Data Visualization", intensity: 4 },
      { skill: "DuckDB/Parquet", intensity: 4 },
      { skill: "SQL", intensity: 2 },
      { skill: "SQLite", intensity: 2 },
      { skill: "Python", intensity: 3 },
      { skill: "CI/CD", intensity: 3 },
      { skill: "Docker", intensity: 3 },
    ],
  },
  {
    id: "medtronic",
    title: "AI Engineering Intern",
    org: "Medtronic (Minimally Invasive Therapies Group)",
    type: "work",
    startDate: "2025-06",
    endDate: "2025-08",
    bullets: [
      "Saved 400+ hours of manual work annually by automating surgical robot log analysis tasks with AI.",
      "Built an AI assistant that analyzes HUGO surgical robot logs at an expert level in minutes instead of tens of hours.",
      "Connected the assistant to internal data sources with MCP and hybrid RAG to answer multi-step questions.",
      "Built the RAG retrieval layer with Chroma and a custom SQLite-based vector search.",
      "Coordinated numerous AI agents and data sources with LangChain/LangGraph to perform complex tasks.",
      "Worked in an Agile environment (Scrum and Kanban via Jira) to manage timelines and deliverables.",
    ],
    skills: [
      { skill: "LangChain/LangGraph", intensity: 5 },
      { skill: "Agentic AI", intensity: 5 },
      { skill: "RAG", intensity: 4 },
      { skill: "Vector Search/Embeddings", intensity: 4 },
      { skill: "MCP", intensity: 3 },
      { skill: "Python", intensity: 4 },
      { skill: "FastAPI", intensity: 3 },
      { skill: "Docker", intensity: 3 },
      { skill: "SQL", intensity: 3 },
      { skill: "SQLite", intensity: 3 },
      { skill: "Agile/Scrum", intensity: 2 },
    ],
  },
  {
    id: "gittlen",
    title: "Software Development and Research Intern",
    org: "Gittlen Cancer Research Labs",
    type: "work",
    startDate: "2024-05",
    endDate: "2024-08",
    bullets: [
      "Built a desktop app (Electron) that lets researchers analyze large 3D medical scans on a laptop by extracting key structures, shrinking files by up to 693× (from 132.08 GB to 190.44 MB).",
      "Designed a Docker-based plugin system so other labs can add their own segmentation methods to the tool.",
      "Achieved approx. 40× faster computation with multithreading and multiprocessing.",
      "Built a React/TypeScript UI with Three.js and Neuroglancer for 3D visualization of segmented scans.",
    ],
    skills: [
      { skill: "Python", intensity: 5 },
      { skill: "Electron", intensity: 3 },
      { skill: "Docker", intensity: 4 },
      { skill: "Multithreading/Perf", intensity: 5 },
      { skill: "React", intensity: 3 },
      { skill: "JS/TS", intensity: 3 },
      { skill: "Data Visualization", intensity: 3 },
    ],
    url: "https://github.com/ChengLabResearch/ouroboros",
  },
  {
    id: "cheng-lab",
    title: "Software Development Intern",
    org: "Cheng Lab, Penn State College of Medicine",
    type: "work",
    startDate: "2021-06",
    endDate: "2021-08",
    bullets: [
      "Developed a key-point scanning tool for micro-CT zebrafish scans using GPU kernels for improved performance.",
      "Designed functional tests through a collaboration with a cybersecurity professional.",
      "Presented the application at a lab meeting alongside novel segmentation techniques.",
    ],
    skills: [
      { skill: "GPU", intensity: 3 },
      { skill: "Computer Vision", intensity: 3 },
      { skill: "JS/TS", intensity: 3 },
      { skill: "Testing", intensity: 3 },
    ],
  },
  {
    id: "freelance",
    title: "Freelance Web Developer",
    type: "work",
    startDate: "2021-03",
    endDate: "2021-06",
    bullets: [
      "Built data visualization widgets and teaching tools for clients using technologies such as p5.js and MathJax.",
      "Handled project planning and negotiation with 15 clients to align with their specific requirements.",
      "Developed maintainable codebases while adapting to varying project scopes.",
    ],
    skills: [
      { skill: "JS/TS", intensity: 3 },
      { skill: "p5.js", intensity: 3 },
      { skill: "Client Communication", intensity: 3 },
    ],
  },
  {
    id: "diffusion-graphs",
    title: "Scaling Diffusion Models to Large Sparse Graphs",
    org: "WPI Major Qualifying Project (MQP), advised by F. Murai & O. Mangoubi",
    type: "project",
    startDate: "2025-08",
    endDate: "2026-05",
    bullets: [
      "Led development of two AI models, Scale-MGD and SparserDiff, that generate realistic networks at scales existing methods can't handle (4-person senior project).",
      "Trained on networks where all prior methods ran out of memory, and made an existing model's generation step up to 116× faster with 89× less memory.",
      "Built RedditWalk, a new benchmark dataset, and targeted molecule and protein generation for drug discovery.",
    ],
    skills: [
      { skill: "PyTorch/ML", intensity: 5 },
      { skill: "Python", intensity: 4 },
      { skill: "Research", intensity: 4 },
    ],
    url: "https://digital.wpi.edu/concern/student_works/kh04dv11x",
  },
  {
    id: "teamgraduate-ai",
    title: "#TeamGraduate AI",
    type: "project",
    startDate: "2026-01",
    endDate: "2026-05",
    bullets: [
      "Built AI tools that turn teachers' lessons into flashcards and study guides aligned to Namibia's curriculum, hosted on Google Cloud Run.",
      "Reduced lesson creation time by 87.7% with AI authoring tools built into the existing website: a custom WordPress plugin backed by a Python service (FastAPI + Pydantic AI).",
      "Implemented a RAG system stored in WordPress's own database tables, populated and queried by the plugin.",
    ],
    skills: [
      { skill: "LLM/AI", intensity: 4 },
      { skill: "RAG", intensity: 3 },
      { skill: "FastAPI", intensity: 3 },
      { skill: "PHP/WordPress Plugins", intensity: 4 },
      { skill: "React", intensity: 3 },
      { skill: "JS/TS", intensity: 3 },
      { skill: "Docker", intensity: 3 },
      { skill: "GCP", intensity: 3 },
      { skill: "Figma", intensity: 2 },
    ],
    url: "https://github.com/We-Gold/teamgraduateai-supporting-materials",
  },
  {
    id: "ouroboros",
    title: "Ouroboros",
    org: "Penn State College of Medicine (manuscript in preparation)",
    type: "project",
    startDate: "2024-05",
    endDate: "present",
    bullets: [
      "Created the core algorithms for a tool that isolates and segments nerves and vessels in terabyte-scale 3D scans.",
      "Shrank the data researchers handle by over 99%, processing a 2.8 TB scan in 6 minutes on a laptop.",
      "Ships as an Electron app with a React/TypeScript UI, a plugin system, and a Neuroglancer-based 3D viewer.",
    ],
    skills: [
      { skill: "Python", intensity: 4 },
      { skill: "Docker", intensity: 3 },
      { skill: "Multithreading/Perf", intensity: 4 },
      { skill: "React", intensity: 3 },
      { skill: "JS/TS", intensity: 3 },
    ],
    url: "https://github.com/ChengLabResearch/ouroboros",
  },
  {
    id: "visualize-guitar",
    title: "Visualize How a Guitar Works",
    org: "WPI Data Visualization (Prof. Lane Harrison)",
    type: "project",
    startDate: "2026-02",
    endDate: "2026-03",
    bullets: [
      "An interactive D3.js, Web Audio API, and Canvas visualization of how a guitar produces sound.",
      "Includes a note editor to compose a piece and hear it played back on the guitar.",
    ],
    skills: [
      { skill: "D3.js", intensity: 5 },
      { skill: "Canvas/Web Audio", intensity: 4 },
      { skill: "Data Visualization", intensity: 5 },
      { skill: "JS/TS", intensity: 3 },
    ],
    url: "https://weavergoldman.com/visualize-guitar/",
  },
  {
    id: "ankirai",
    title: "ankirai",
    type: "project",
    startDate: "2026-05",
    endDate: "2026-05",
    bullets: [
      "A CLI published to PyPI that transforms notes (PDFs and more) into Anki flashcards quickly using any LLM provider.",
      "Includes a human-in-the-loop review mode to approve, edit, or reject cards before export.",
    ],
    skills: [
      { skill: "Python", intensity: 4 },
      { skill: "LLM/AI", intensity: 4 },
      { skill: "CLI/Packaging", intensity: 3 },
    ],
    url: "https://pypi.org/project/ankirai/",
  },
  {
    id: "acl-injury-risk",
    title: "ACL Injury Risk Prediction",
    org: "WPI DS 502",
    type: "project",
    startDate: "2025-08",
    endDate: "2025-12",
    bullets: [
      "5-person team project predicting ACL injury risk for college athletes from a Kaggle athlete injury/performance dataset.",
      "Addressed extreme class imbalance with SMOTE and random oversampling, and used t-SNE to visualize class separability.",
    ],
    skills: [
      { skill: "Python", intensity: 4 },
      { skill: "ML/scikit-learn", intensity: 4 },
      { skill: "Pandas", intensity: 4 },
      { skill: "Data Visualization", intensity: 2 },
    ],
    url: "https://github.com/We-Gold/wpi-acl-injury-risk",
  },
  {
    id: "wpi-greenboard",
    title: "WPI Greenboard",
    org: "WPI CS 542",
    type: "project",
    startDate: "2025-08",
    endDate: "2025-12",
    bullets: [
      "4-person team project building an unofficial carbon emissions leaderboard for WPI, estimating impact from packages delivered to the campus mailroom.",
      "Built a Streamlit UI backed by a FastAPI service and a PostgreSQL database, with a Dockerized deployment.",
    ],
    skills: [
      { skill: "Python", intensity: 4 },
      { skill: "Streamlit", intensity: 4 },
      { skill: "FastAPI", intensity: 3 },
      { skill: "SQL", intensity: 3 },
      { skill: "PostgreSQL", intensity: 3 },
      { skill: "Docker", intensity: 4 },
    ],
    url: "https://github.com/We-Gold/wpi-greenboard",
  },
  {
    id: "nyc-transit",
    title: "Identifying Transit Accessibility Gaps in NYC",
    org: "WPI DS 501",
    type: "project",
    startDate: "2025-03",
    endDate: "2025-04",
    bullets: [
      "Found underserved NYC neighborhoods, using distance to the nearest subway station (from GTFS data) as a proxy for accessibility.",
      "Forecast revenue for potential new stations with a Random Forest Regressor (R² = 0.675) over 6 years of data.",
      "Pinpointed potential stops predicted to earn over $4 million annually, using interactive opportunity maps.",
    ],
    skills: [
      { skill: "Python", intensity: 4 },
      { skill: "ML/scikit-learn", intensity: 4 },
      { skill: "Pandas", intensity: 4 },
      { skill: "Data Visualization", intensity: 3 },
    ],
    url: "https://github.com/We-Gold/ds-501-cs4-public",
  },
  {
    id: "gpxjs",
    title: "GPX.JS",
    type: "project",
    startDate: "2023-06",
    endDate: "present",
    bullets: [
      "A modern, TypeScript-first library for parsing GPX files and converting them to GeoJSON, published to npm as @we-gold/gpxjs.",
      "A maintained successor to the unmaintained GPXParser.js, with full TypeScript support and a Vitest/Playwright browser test suite.",
      "Runs coverage checks and an npm publish workflow through GitHub Actions CI.",
    ],
    skills: [
      { skill: "JS/TS", intensity: 4 },
      { skill: "Testing", intensity: 3 },
      { skill: "CI/CD", intensity: 3 },
    ],
    url: "https://github.com/We-Gold/gpxjs",
  },
];

// Interleave work + projects into one reverse-chronological stream.
// Sort by end date (ongoing roles first), tiebroken by start date.
const monthIndex = (d: string) => {
  const [y, m] = d.split("-").map(Number);
  return y * 12 + (m - 1);
};
experienceEntries.sort((a, b) => {
  const aEnd = a.endDate === "present" ? Infinity : monthIndex(a.endDate);
  const bEnd = b.endDate === "present" ? Infinity : monthIndex(b.endDate);
  return bEnd - aEnd || monthIndex(b.startDate) - monthIndex(a.startDate);
});

// ---------------------------------------------------------------------------
// Skill areas: overarching groupings that the granular skills roll up into.
// Each area gets a distinct color used across the graph (hub + its edge skills).
// ---------------------------------------------------------------------------

export interface SkillArea {
  id: string;
  name: string; // full name (legend, tooltip)
  short: string; // short label rendered inside the hub bubble
  color: string;
}

export const skillAreas: SkillArea[] = [
  { id: "ai-ml", name: "AI & ML", short: "AI & ML", color: "#8b5cf6" },
  { id: "data-viz", name: "Data Visualization", short: "Data Viz", color: "#f59e0b" },
  { id: "systems", name: "Systems & Performance", short: "Systems", color: "#f43f5e" },
  { id: "backend", name: "Backend & Cloud", short: "Backend", color: "#0d9488" },
  { id: "frontend", name: "Web & Frontend", short: "Frontend", color: "#3b82f6" },
  { id: "practices", name: "Practices & Collaboration", short: "Practices", color: "#64748b" },
];

// Every granular skill string used in `experienceEntries` maps to one area.
export const skillToArea: Record<string, string> = {
  // AI & ML
  "LLM Evaluation": "ai-ml",
  "LLM/AI": "ai-ml",
  "Agentic AI": "ai-ml",
  "LangChain/LangGraph": "ai-ml",
  "RAG": "ai-ml",
  "MCP": "ai-ml",
  "Vector Search/Embeddings": "ai-ml",
  "PyTorch/ML": "ai-ml",
  "ML/scikit-learn": "ai-ml",
  "Unsupervised ML": "ai-ml",
  "Computer Vision": "ai-ml",
  // Data Visualization
  "Data Visualization": "data-viz",
  "D3.js": "data-viz",
  "Canvas/Web Audio": "data-viz",
  "p5.js": "data-viz",
  "visx": "data-viz",
  "Plotly Dash": "data-viz",
  // Systems & Performance
  "Multithreading/Perf": "systems",
  "GPU": "systems",
  "Async/SDK Design": "systems",
  // Backend & Cloud
  "Python": "backend",
  "AWS": "backend",
  "GCP": "backend",
  "Docker": "backend",
  "FastAPI": "backend",
  "SQL": "backend",
  "SQLite": "backend",
  "PostgreSQL": "backend",
  "DuckDB/Parquet": "backend",
  "MLOps": "backend",
  "CLI/Packaging": "backend",
  "Pandas": "backend",
  // Web & Frontend
  "React": "frontend",
  "Three.js": "frontend",
  "JS/TS": "frontend",
  "Electron": "frontend",
  "Streamlit": "frontend",
  "PHP/WordPress Plugins": "frontend",
  "Figma": "frontend",
  // Practices & Collaboration
  "Testing": "practices",
  "CI/CD": "practices",
  "Agile/Scrum": "practices",
  "Research": "practices",
  "Client Communication": "practices",
};

export interface SkillTotal {
  skill: string;
  areaId: string;
  total: number; // breadth x depth: sum of per-entry intensity across all entries
  entryIds: string[];
}

export function aggregateSkillTotals(entries: ExperienceEntry[]): SkillTotal[] {
  const totals = new Map<string, SkillTotal>();

  for (const entry of entries) {
    for (const { skill, intensity } of entry.skills) {
      const areaId = skillToArea[skill] ?? "practices";
      const existing = totals.get(skill);
      if (existing) {
        existing.total += intensity;
        existing.entryIds.push(entry.id);
      } else {
        totals.set(skill, { skill, areaId, total: intensity, entryIds: [entry.id] });
      }
    }
  }

  return Array.from(totals.values()).sort((a, b) => b.total - a.total);
}

export interface AreaTotal extends SkillArea {
  total: number;
}

export function aggregateAreaTotals(skillTotals: SkillTotal[]): AreaTotal[] {
  return skillAreas.map((area) => ({
    ...area,
    total: skillTotals
      .filter((s) => s.areaId === area.id)
      .reduce((sum, s) => sum + s.total, 0),
  }));
}
