// Illustrative content for the NITI Smriti prototype: officer, people, documents,
// and the scripted answers used by Ask Smriti, Check a draft and Handover brief.
// None of these documents are real. Edit freely.

const USER = {
  id: "p1",
  name: "Ms. Anna Roy",
  greeting: "Welcome, Ms. Roy",
  greetingHi: "स्वागत है, सुश्री रॉय",
  designation: "Programme Director",
  initials: "AR",
  divisions: ["Data Management & Analysis", "Managing Urbanisation", "Research & Networking"],
  isSteward: true
};

const PEOPLE = {
  p1: { name: "Ms. Anna Roy", role: "Programme Director", division: "Data Management & Analysis", email: "anna.roy@example.in" },
  p2: { name: "Rohit Mehra", role: "Senior Specialist", division: "E-Mobility", email: "rohit.mehra@example.in" },
  p3: { name: "Kavita Iyer", role: "Deputy Adviser", division: "Energy", previous: "E-Mobility (2022-2025)", email: "kavita.iyer@example.in" },
  p4: { name: "Sameer Khan", role: "Deputy Adviser", division: "Managing Urbanisation", email: "sameer.khan@example.in" },
  p5: { name: "Priya Nair", role: "Young Professional", division: "Data Management & Analysis", email: "priya.nair@example.in" },
  p6: { name: "Arvind Sethi", role: "Senior Research Officer", division: "Research & Networking", email: "arvind.sethi@example.in" },
  p7: { name: "Neha Gupta", role: "Consultant", division: "Health & Family Welfare", email: "neha.gupta@example.in" },
  p8: { name: "Manoj Pillai", role: "Director", division: "Development Monitoring and Evaluation Office (DMEO)", email: "manoj.pillai@example.in" },
  p9: { name: "Farah Siddiqui", role: "Deputy Adviser", division: "Sustainable Development Goals", email: "farah.siddiqui@example.in" },
  p10: { name: "Vikram Rao", role: "Senior Consultant", division: "Mines & Minerals", email: "vikram.rao@example.in" },
  p11: { name: "Ishaan Verma", role: "Young Professional", division: "Managing Urbanisation", email: "ishaan.verma@example.in" },
  p12: { name: "Meera Joshi", role: "Senior Specialist", division: "Skill Development, Labour & Employment", email: "meera.joshi@example.in" }
};

// Document types shared by every Division (concept note, Table 1)
const DOC_TYPES_COMMON = [
  "Project initiation papers", "Meeting records", "Views sent to Ministries", "Consultant and PMU deliverables",
  "State engagement records", "Parliament and RTI replies", "Final outputs", "Data and methods",
  "Project closure note", "Handover note"
];
// Additional types by group (concept note, Table 2)
const DOC_TYPES_BY_GROUP = {
  "Sector Divisions": ["Sector brief", "Expert and stakeholder consultations", "State practices"],
  "Economy & Finance": ["Economic monitoring notes", "Models and forecasts", "Appraisal notes"],
  "States & Coordination": ["Council and conference records", "Index and ranking rounds", "State profiles"],
  "Data, Research & Reform": ["Datasets and data dictionaries", "Research studies", "Platform and dashboard documentation"],
  "Internal Functions": ["Orders and circulars", "Procurement and contracts", "Legal opinions and agreements"],
  "Attached Office": ["Evaluation studies", "Monitoring frameworks", "Evaluation tools and training material"]
};

const NODAL_OFFICERS = {
  "Data Management & Analysis": "p5", "Managing Urbanisation": "p11", "Research & Networking": "p6",
  "E-Mobility": "p2", "Energy": "p3", "Health & Family Welfare": "p7"
};

// access: Public | NITI-wide | SMD | Restricted
// source: Published NITI report | NITI internal | External agency
const DOCS = [
  {
    id: "d1", title: "Handbook on public EV charging infrastructure for States",
    division: "E-Mobility", category: "B", docType: "Final outputs", source: "Published NITI report",
    access: "Public", date: "2026-11-06", author: "p3", owner: "p2", status: "Final", verified: true, version: "v2", language: "English",
    efile: "EM-11011/4/2025-EM", tags: { sector: "Transport", states: ["All States"], ministry: "Ministry of Power", year: 2026 },
    summary: "Planning norms, siting and tariff options for State nodal agencies setting up public charging.",
    body: [
      { page: 4, text: "States should plan public charging along a hierarchy of urban, highway and destination sites, with one public charger for every 40 electric vehicles in urban areas as an indicative norm." },
      { page: 9, text: "The handbook recommends a State-led rollout, in which State nodal agencies identify sites and run transparent bidding, with central support limited to standards and viability gap funding." },
      { page: 15, text: "Tariffs for public charging should be single-part and capped during the early market phase, to be reviewed after three years." }
    ],
    related: ["d2", "d3", "d4"]
  },
  {
    id: "d2", title: "Battery swapping policy approach",
    division: "E-Mobility", category: "B", docType: "Final outputs", source: "Published NITI report",
    access: "Public", date: "2026-10-22", author: "p2", owner: "p2", status: "Final", verified: true, version: "v1", language: "English",
    efile: "EM-11011/7/2025-EM", tags: { sector: "Transport", states: ["All States"], ministry: "Ministry of Road Transport & Highways", year: 2026 },
    summary: "Policy approach for battery swapping in two- and three-wheelers: interoperability, standards and business models.",
    body: [
      { page: 3, text: "NITI's approach treats battery swapping as a complement to plug-in charging, most suited to two- and three-wheelers in commercial use." },
      { page: 7, text: "Interoperability standards for battery packs and swapping stations are the main enabler; the approach proposes phased standards over three years." },
      { page: 12, text: "Battery-as-a-service models can lower the upfront cost of an electric two-wheeler by close to 40 percent." }
    ],
    related: ["d1", "d3", "d5"]
  },
  {
    id: "d3", title: "Grid impact of large-scale EV charging: scenario note",
    division: "Energy", category: "A", docType: "Data and methods", source: "NITI internal",
    access: "NITI-wide", date: "2026-11-04", author: "p3", owner: "p3", status: "Working draft", verified: false, version: "v3", language: "English",
    efile: "EN-14022/2/2026-Energy", tags: { sector: "Energy", states: ["Delhi", "Maharashtra", "Karnataka"], ministry: "Ministry of Power", year: 2026 },
    summary: "Distribution-level load scenarios for 2030 under three adoption pathways, including battery swapping stations.",
    body: [
      { page: 2, text: "Under the high-adoption pathway, peak distribution load in large cities rises by 6 to 9 percent by 2030 if charging is unmanaged." },
      { page: 5, text: "Battery swapping stations shift charging to off-peak hours and reduce the evening peak by about a third compared with home charging." },
      { page: 8, text: "Time-of-day tariffs and managed charging can absorb most of the additional load without new distribution capacity." }
    ],
    related: ["d1", "d2"]
  },
  {
    id: "d4", title: "Highway charging corridors: draft note",
    division: "E-Mobility", category: "A", docType: "Views sent to Ministries", source: "NITI internal",
    access: "NITI-wide", date: "2026-11-05", author: "p2", owner: "p2", status: "Working draft", verified: false, version: "v4", language: "English",
    efile: "EM-11011/9/2026-EM", tags: { sector: "Transport", states: ["All States"], ministry: "Ministry of Road Transport & Highways", year: 2026 },
    summary: "Draft note on fast-charging corridors along national highways, sent to Ministries for comments.",
    body: [
      { page: 2, text: "The note proposes fast chargers every 25 km on both sides of identified national highway corridors." },
      { page: 6, text: "Comments from the Ministries are awaited; the note will be revised after the State consultation." }
    ],
    related: ["d1"]
  },
  {
    id: "d5", title: "Draft guidelines on battery swapping stations",
    division: "E-Mobility", category: "C", docType: "Views sent to Ministries", source: "External agency", external: "Ministry of Power",
    access: "NITI-wide", date: "2026-09-18", author: "p2", owner: "p2", status: "Final", verified: true, version: "v1", language: "English",
    efile: "EM-11011/8/2026-EM", tags: { sector: "Energy", states: ["All States"], ministry: "Ministry of Power", year: 2026 },
    summary: "Draft guidelines received from the Ministry for safety, tariffs and grid connection of swapping stations.",
    body: [
      { page: 1, text: "The draft guidelines set safety standards and allow swapping stations to draw power at the applicable commercial tariff." },
      { page: 4, text: "Comments are sought from NITI Aayog on the tariff treatment and interoperability provisions." }
    ],
    related: ["d2"]
  },
  {
    id: "d6", title: "District-level trends in institutional deliveries",
    division: "Health & Family Welfare", category: "B", docType: "Final outputs", source: "Published NITI report",
    access: "NITI-wide", date: "2026-10-31", author: "p7", owner: "p7", status: "Final", verified: true, version: "v1", language: "English",
    efile: "H-12013/3/2026-Health", tags: { sector: "Health", states: ["Uttar Pradesh", "Bihar", "Odisha"], ministry: "Ministry of Health & Family Welfare", year: 2026 },
    summary: "Analysis of focus districts across two survey rounds, with data pack and methodology note.",
    body: [
      { page: 3, text: "Across the 12 focus districts, institutional deliveries rose from 78.9 percent to 88.6 percent between the two survey rounds." },
      { page: 6, text: "Variation between districts remains high; the lowest-performing districts are concentrated in a few northern districts." }
    ],
    related: ["d7"]
  },
  {
    id: "d7", title: "Data pack: maternal health indicators by district",
    division: "Health & Family Welfare", category: "A", docType: "Data and methods", source: "NITI internal",
    access: "NITI-wide", date: "2026-10-31", author: "p7", owner: "p7", status: "Final", verified: true, version: "v1", language: "English",
    efile: "H-12013/3/2026-Health", tags: { sector: "Health", states: ["Uttar Pradesh", "Bihar", "Odisha"], ministry: "Ministry of Health & Family Welfare", year: 2026 },
    summary: "District-level dataset, data dictionary and known limitations behind the institutional deliveries report.",
    body: [{ page: 1, text: "This data pack contains district-level indicators from two survey rounds, harmonised to LGD district codes." }],
    related: ["d6"]
  },
  {
    id: "d8", title: "Minutes: consultation with State planning departments on SDG localisation",
    division: "Sustainable Development Goals", category: "C", docType: "Meeting records", source: "NITI internal",
    access: "NITI-wide", date: "2026-10-29", author: "p9", owner: "p9", status: "Final", verified: true, version: "v1", language: "English",
    efile: "SDG-19011/2/2026-SDG", tags: { sector: "Governance", states: ["Assam", "Meghalaya", "Tripura"], ministry: "", year: 2026 },
    summary: "Agenda, decisions and action points from the regional consultation.",
    body: [{ page: 1, text: "States agreed to align district indicator frameworks with the national SDG index and report quarterly." }],
    related: ["d9"]
  },
  {
    id: "d9", title: "SDG India Index: methodology note for the next round",
    division: "Sustainable Development Goals", category: "A", docType: "Data and methods", source: "NITI internal",
    access: "NITI-wide", date: "2026-08-20", author: "p9", owner: "p9", status: "Working draft", verified: false, version: "v2", language: "English",
    efile: "SDG-19011/1/2026-SDG", tags: { sector: "Governance", states: ["All States"], ministry: "", year: 2026 },
    summary: "Indicator framework and scoring method proposed for the next round of the index, using PLFS for labour indicators.",
    body: [{ page: 3, text: "Labour market indicators will be drawn from the annual PLFS, using the usual status measure for unemployment." }],
    related: ["d8"]
  },
  {
    id: "d10", title: "Critical minerals: demand outlook and supply-chain options",
    division: "Mines & Minerals", category: "D", docType: "Consultant and PMU deliverables", source: "External agency", external: "Knowledge partner",
    access: "NITI-wide", date: "2026-10-27", author: "p10", owner: "p10", status: "Final", verified: true, version: "v1", language: "English",
    efile: "MM-17011/1/2026-MM", tags: { sector: "Mining", states: ["Odisha", "Jharkhand", "Rajasthan"], ministry: "Ministry of Mines", year: 2026 },
    summary: "Joint working paper with a knowledge partner on lithium, cobalt and rare earths.",
    body: [{ page: 5, text: "Demand for lithium for batteries could rise more than tenfold by 2035 under the high EV adoption scenario." }],
    related: ["d11"]
  },
  {
    id: "d11", title: "Critical minerals in India: status note",
    division: "Mines & Minerals", category: "B", docType: "Sector brief", source: "Published NITI report",
    access: "Public", date: "2024-03-12", author: "p10", owner: "p10", status: "Final", verified: true, version: "v1", language: "English",
    efile: "MM-17011/3/2023-MM", tags: { sector: "Mining", states: ["All States"], ministry: "Ministry of Mines", year: 2024 },
    summary: "Standing note on reserves, production, import dependence and policy measures for critical minerals.",
    body: [{ page: 2, text: "India remains import-dependent for most critical minerals, including lithium and cobalt." }],
    related: ["d10"]
  },
  {
    id: "d12", title: "Recycling of lithium-ion batteries: issues paper",
    division: "Mines & Minerals", category: "A", docType: "Expert and stakeholder consultations", source: "NITI internal",
    access: "SMD", date: "2025-07-02", author: "p10", owner: "p10", status: "Working draft", verified: false, version: "v1", language: "English",
    efile: "MM-17011/2/2025-MM", tags: { sector: "Mining", states: [], ministry: "Ministry of Environment, Forest & Climate Change", year: 2025 },
    summary: "Issues paper on recovery of critical minerals from end-of-life batteries.",
    body: [{ page: 1, text: "Recycling could meet a modest share of demand by 2035." }], related: ["d10"]
  },
  // ---- Data Management & Analysis ----
  {
    id: "d13", title: "Draft protocol for NITI Smriti: upload and access",
    division: "Data Management & Analysis", category: "A", docType: "Project initiation papers", source: "NITI internal",
    access: "SMD", date: "2026-11-07", author: "p1", owner: "p1", status: "Working draft", verified: false, version: "v3", language: "English",
    efile: "DMA-21011/5/2026-DMA", tags: { sector: "Governance", states: [], ministry: "", year: 2026 },
    summary: "Who uploads, which access level, who verifies, and the fortnightly upload rhythm.",
    body: [
      { page: 1, text: "Each SMD will nominate an uploader and a data steward. Any officer may upload their own working drafts at SMD or Restricted level." },
      { page: 2, text: "New final outputs are to be uploaded within five working days of finalisation, and in any case on the 1st and 16th of each month." }
    ],
    related: ["d14", "d15"]
  },
  {
    id: "d14", title: "Data-quality rating framework for NDAP datasets",
    division: "Data Management & Analysis", category: "B", docType: "Platform and dashboard documentation", source: "NITI internal",
    access: "NITI-wide", date: "2026-10-28", author: "p5", owner: "p1", status: "Final", verified: true, version: "v2", language: "English",
    efile: "DMA-21011/3/2026-DMA", tags: { sector: "Data", states: [], ministry: "Ministry of Statistics & Programme Implementation", year: 2026 },
    summary: "A five-point rating of datasets on timeliness, coverage, granularity, metadata and machine-readability.",
    body: [{ page: 2, text: "Each dataset on NDAP is rated on five dimensions; the composite rating is shown on the dataset page." }],
    related: ["d15"]
  },
  {
    id: "d15", title: "Minutes: review of the indicator registry with SMDs",
    division: "Data Management & Analysis", category: "C", docType: "Meeting records", source: "NITI internal",
    access: "NITI-wide", date: "2026-10-21", author: "p5", owner: "p1", status: "Final", verified: true, version: "v1", language: "English",
    efile: "DMA-21011/4/2026-DMA", tags: { sector: "Data", states: [], ministry: "", year: 2026 },
    summary: "Decisions on standard indicator definitions and the owner SMD for each indicator.",
    body: [{ page: 1, text: "SMDs agreed that each indicator in the registry will have one owner SMD responsible for its definition and source." }],
    related: ["d14"]
  },
  {
    id: "d16", title: "Labour market indicators from PLFS: State-wise compendium",
    division: "Data Management & Analysis", category: "B", docType: "Datasets and data dictionaries", source: "NITI internal",
    access: "NITI-wide", date: "2026-09-15", author: "p5", owner: "p1", status: "Final", verified: true, version: "v1", language: "English",
    efile: "DMA-21011/2/2026-DMA", tags: { sector: "Labour", states: ["All States"], ministry: "Ministry of Labour & Employment", year: 2026 },
    summary: "State-wise LFPR, WPR and unemployment from PLFS with survey weights, data dictionary and limitations.",
    body: [{ page: 2, text: "All estimates use PLFS unit-level data with survey weights; usual status (ps+ss) is the reference measure." }],
    related: ["d17", "d9"]
  },
  {
    id: "d17", title: "Women's labour force participation: what PLFS shows",
    division: "Skill Development, Labour & Employment", category: "B", docType: "Final outputs", source: "Published NITI report",
    access: "Public", date: "2026-06-10", author: "p12", owner: "p12", status: "Final", verified: true, version: "v1", language: "English",
    efile: "SDLE-15011/1/2026-SDLE", tags: { sector: "Labour", states: ["All States"], ministry: "Ministry of Labour & Employment", year: 2026 },
    summary: "Trends in female LFPR by State, rural and urban, using annual PLFS rounds.",
    body: [{ page: 4, text: "Female LFPR has risen steadily across recent PLFS rounds, led by rural self-employment." }],
    related: ["d16"]
  },
  // ---- Managing Urbanisation ----
  {
    id: "d18", title: "Municipal finance in million-plus cities: working note",
    division: "Managing Urbanisation", category: "A", docType: "Sector brief", source: "NITI internal",
    access: "SMD", date: "2026-11-03", author: "p4", owner: "p4", status: "Working draft", verified: false, version: "v2", language: "English",
    efile: "MU-16011/6/2026-MU", tags: { sector: "Urban", states: ["Maharashtra", "Tamil Nadu", "Gujarat"], ministry: "Ministry of Housing & Urban Affairs", year: 2026 },
    summary: "Own-source revenue, property tax and borrowing capacity of large cities.",
    body: [
      { page: 2, text: "Property tax collection in most million-plus cities is below 0.2 percent of city GDP." },
      { page: 5, text: "The note suggests a property tax reform pilot in three cities, pending discussion with the States." }
    ],
    related: ["d19", "d20"]
  },
  {
    id: "d19", title: "Strengthening city governments: options paper",
    division: "Managing Urbanisation", category: "B", docType: "Final outputs", source: "Published NITI report",
    access: "Public", date: "2026-10-16", author: "p4", owner: "p4", status: "Final", verified: true, version: "v1", language: "English",
    efile: "MU-16011/3/2026-MU", tags: { sector: "Urban", states: ["All States"], ministry: "Ministry of Housing & Urban Affairs", year: 2026 },
    summary: "Options for empowered city governments in million-plus cities: functions, finances and functionaries.",
    body: [
      { page: 3, text: "The paper recommends that million-plus cities have a directly accountable executive with control over core urban functions." },
      { page: 11, text: "Cities should be enabled to raise market borrowings, subject to fiscal rules set by the State." }
    ],
    related: ["d18", "d20"]
  },
  {
    id: "d20", title: "Visit note: urban planning reforms, consultation with States",
    division: "Managing Urbanisation", category: "C", docType: "State engagement records", source: "NITI internal",
    access: "NITI-wide", date: "2026-10-09", author: "p11", owner: "p4", status: "Final", verified: true, version: "v1", language: "English",
    efile: "MU-16011/5/2026-MU", tags: { sector: "Urban", states: ["Gujarat", "Madhya Pradesh"], ministry: "Ministry of Housing & Urban Affairs", year: 2026 },
    summary: "Notes from State visits on master planning capacity and town planning schemes.",
    body: [{ page: 1, text: "Both States asked for support to build a cadre of town planners and to digitise master plans." }],
    related: ["d19"]
  },
  {
    id: "d21", title: "Handover note: urban data initiatives",
    division: "Managing Urbanisation", category: "A", docType: "Handover note", source: "NITI internal",
    access: "SMD", date: "2026-07-30", author: "p11", owner: "p4", status: "Final", verified: true, version: "v1", language: "English",
    efile: "MU-16011/2/2026-MU", tags: { sector: "Urban", states: [], ministry: "", year: 2026 },
    summary: "Ongoing work, pending files and contacts on urban data handed over by an outgoing Young Professional.",
    body: [{ page: 1, text: "Pending: draft city data standards with MoHUA; contact for city dashboards is the State urban data cell." }],
    related: ["d18"]
  },
  // ---- Research & Networking ----
  {
    id: "d22", title: "Call for proposals: research studies 2026-27",
    division: "Research & Networking", category: "B", docType: "Research studies", source: "Published NITI report",
    access: "Public", date: "2026-11-05", author: "p6", owner: "p6", status: "Final", verified: true, version: "v1", language: "English",
    efile: "RN-18011/1/2026-RN", tags: { sector: "Research", states: [], ministry: "", year: 2026 },
    summary: "Themes, eligibility and timelines for funded research studies.",
    body: [{ page: 1, text: "Priority themes include urban jobs, State capacity for data, and the energy transition." }],
    related: ["d23"]
  },
  {
    id: "d23", title: "Review comments on funded study: State capacity for data",
    division: "Research & Networking", category: "A", docType: "Research studies", source: "NITI internal",
    access: "SMD", date: "2026-10-30", author: "p6", owner: "p6", status: "Working draft", verified: false, version: "v1", language: "English",
    efile: "RN-18011/4/2025-RN", tags: { sector: "Data", states: ["Kerala", "Rajasthan"], ministry: "", year: 2026 },
    summary: "Comments on the interim report; sampling of districts and data sources to be revisited.",
    body: [{ page: 1, text: "The interim report should explain how districts were sampled and reconcile its figures with PLFS estimates." }],
    related: ["d22", "d16"]
  },
  {
    id: "d24", title: "Inception report: knowledge partner study on urban jobs",
    division: "Research & Networking", category: "D", docType: "Consultant and PMU deliverables", source: "External agency", external: "Knowledge partner",
    access: "NITI-wide", date: "2026-10-12", author: "p6", owner: "p6", status: "Final", verified: true, version: "v1", language: "English",
    efile: "RN-18011/3/2026-RN", tags: { sector: "Labour", states: ["Uttar Pradesh", "Karnataka"], ministry: "", year: 2026 },
    summary: "Approach, sampling and timelines for a study on informal urban employment using PLFS and primary surveys.",
    body: [{ page: 2, text: "The study will combine PLFS urban quarterly data with a primary survey in four cities." }],
    related: ["d22", "d16"]
  },
  // ---- DMEO and others ----
  {
    id: "d25", title: "Evaluation of a centrally sponsored urban scheme: final report",
    division: "Development Monitoring and Evaluation Office (DMEO)", category: "B", docType: "Evaluation studies", source: "Published NITI report",
    access: "Public", date: "2025-12-18", author: "p8", owner: "p8", status: "Final", verified: true, version: "v1", language: "English",
    efile: "DMEO-22011/6/2025-DMEO", tags: { sector: "Urban", states: ["All States"], ministry: "Ministry of Housing & Urban Affairs", year: 2025 },
    summary: "Outcomes, implementation gaps and recommendations from a national evaluation.",
    body: [{ page: 7, text: "The evaluation finds that outcomes were strongest where cities had dedicated project management units." }],
    related: ["d19"]
  },
  {
    id: "d26", title: "Inputs on the Budget Speech: urban and data",
    division: "Data Management & Analysis", category: "C", docType: "Views sent to Ministries", source: "NITI internal",
    access: "Restricted", restrictedTo: ["p1", "p5"], date: "2026-01-20", author: "p1", owner: "p1", status: "Final", verified: true, version: "v1", language: "English",
    efile: "DMA-21011/1/2026-DMA", tags: { sector: "Governance", states: [], ministry: "Ministry of Finance", year: 2026 },
    summary: "Inputs sent for the Budget Speech; visible only to named officers.",
    body: [{ page: 1, text: "Restricted document. Contents are illustrative." }], related: []
  },
  {
    id: "d27", title: "Contract amendment: PMU support for NDAP",
    division: "Integrated Finance Division", category: "C", docType: "Procurement and contracts", source: "NITI internal",
    access: "Restricted", restrictedTo: ["p8"], date: "2026-05-02", author: "p8", owner: "p8", status: "Final", verified: true, version: "v1", language: "English",
    efile: "IFD-23011/2/2026-IFD", tags: { sector: "Governance", states: [], ministry: "", year: 2026 }, summary: "Restricted.", body: [], related: []
  },
  {
    id: "d28", title: "Energy transition pathways: working draft",
    division: "Energy", category: "A", docType: "Models and forecasts", source: "NITI internal",
    access: "SMD", date: "2026-09-30", author: "p3", owner: "p3", status: "Working draft", verified: false, version: "v5", language: "English",
    efile: "EN-14022/1/2026-Energy", tags: { sector: "Energy", states: [], ministry: "Ministry of Power", year: 2026 }, summary: "SMD only.", body: [], related: []
  }
];

// ---------- Ask Smriti: scripted answers ----------
// Each script matches on keywords. Citations point to [doc id, page].
const ASK_SCRIPTS = [
  {
    match: ["battery", "swap"],
    answer: [
      "NITI has set out a policy approach to battery swapping that treats it as a complement to plug-in charging, best suited to two- and three-wheelers in commercial use {1}. Interoperability standards for battery packs and stations are seen as the main enabler, phased over three years {2}.",
      "The Energy SMD has assessed the grid impact: swapping stations shift charging off-peak and reduce the evening peak by about a third compared with home charging {3}.",
      "The Ministry of Power's draft guidelines on swapping stations are with NITI for comments, on tariff treatment and interoperability {4}."
    ],
    cites: [["d2", 3], ["d2", 7], ["d3", 5], ["d5", 4]],
    overlap: "The Energy SMD has analysed grid impact of EV charging, including swapping. Consult Kavita Iyer before starting new work on this.",
    followups: ["What is still pending on battery swapping?", "Who has worked on EV charging in NITI?", "Draft a note with these sources"]
  },
  {
    match: ["managing urbanisation", "urban", "brief me"],
    answer: [
      "Managing Urbanisation has published an options paper on strengthening city governments in million-plus cities, recommending a directly accountable city executive {1} and enabling cities to borrow within State fiscal rules {2}.",
      "Work in progress: a working note on municipal finance finds property tax collection below 0.2 percent of city GDP in most large cities {3}, and proposes a three-city reform pilot pending State discussions {4}.",
      "Recent State visits found demand for a cadre of town planners and digitised master plans {5}."
    ],
    cites: [["d19", 3], ["d19", 11], ["d18", 2], ["d18", 5], ["d20", 1]],
    pending: ["Minutes of the 5 Nov urban planning consultation (due in 3 working days)", "State discussion on the property tax pilot", "City data standards with MoHUA (from the handover note)"],
    followups: ["Show the handover note for urban data", "Which other SMDs have worked on cities?", "Get a full handover brief"]
  },
  {
    match: ["plfs"],
    answer: [
      "Three SMDs have used PLFS data in recent work. Data Management & Analysis has a State-wise compendium of labour indicators using unit-level data with survey weights {1}. Skill Development, Labour & Employment has published trends in women's labour force participation {2}.",
      "The SDG SMD plans to draw labour indicators for the next index round from the annual PLFS {3}, and a Research & Networking study on urban jobs combines PLFS urban data with a primary survey {4}."
    ],
    cites: [["d16", 2], ["d17", 4], ["d9", 3], ["d24", 2]],
    overlap: "Two documents use different PLFS status measures. Check before quoting figures across them.",
    followups: ["Which PLFS round does each use?", "Open the PLFS compendium"]
  },
  {
    match: ["ev charging", "charging", "e-mobility"],
    answer: [
      "NITI's handbook guides States on public charging, recommending a State-led rollout with central support limited to standards and viability gap funding {1}, and an indicative norm of one public charger for every 40 EVs in urban areas {2}.",
      "A draft note on highway charging corridors, proposing fast chargers every 25 km, is with the Ministries for comments {3}. The Energy SMD's scenario note shows managed charging can absorb most of the added load {4}."
    ],
    cites: [["d1", 9], ["d1", 4], ["d4", 2], ["d3", 8]],
    followups: ["What has NITI already done on battery swapping?", "Who wrote the charging handbook?"]
  }
];

// "Give me all reports on X" style queries return a list instead of an answer
const LIST_TRIGGERS = ["all reports", "all documents", "list", "reports on", "documents on"];

// ---------- Check a draft: scripted example ----------
const DRAFT_CHECK = {
  title: "EV charging paper", version: "Draft v3", division: "E-Mobility",
  sections: [
    { heading: "2. Charging targets", text: "To support the expected growth in electric vehicles, the paper recommends [[f1|one public charger for every 60 electric vehicles in urban areas]] by 2030, rising with adoption." },
    { heading: "3. Rollout model", text: "The paper proposes that [[f2|charging infrastructure be rolled out centrally through a single national agency]], with States facilitating land and power connections." },
    { heading: "4. Timeline", text: "Standards for interoperable chargers will be notified [[f3|within 12 months of approval]], followed by bidding for highway corridors." },
    { heading: "5. Implementation", text: "Bidding for highway corridors begins once standards are notified, [[f3b|expected 24 months after approval]]. Tariffs will be single-part and capped in the early phase." }
  ],
  flags: [
    { id: "f1", type: "Differs from an earlier NITI report", text: "Charger target differs from the handbook: the handbook uses one public charger for every 40 EVs in urban areas.", cite: ["d1", 4] },
    { id: "f2", type: "Departs from NITI's position", text: "Proposes a central rollout; NITI's handbook recommends a State-led rollout with central support for standards and viability gap funding.", cite: ["d1", 9] },
    { id: "f3", type: "Inconsistent within the draft", text: "Sections 4 and 5 state different timelines for notifying standards (12 months vs 24 months).", cite: null, also: "f3b" }
  ]
};

// ---------- Handover brief: scripted ----------
const HANDOVER = {
  "E-Mobility": {
    topic: "EV charging",
    summary: [
      "The SMD's main published work is the handbook guiding States on public EV charging, recommending a State-led rollout {1}, and a policy approach to battery swapping {2}.",
      "A draft note on highway charging corridors is with the Ministries {3}, and the Ministry of Power's draft swapping guidelines await NITI's comments {4}."
    ],
    cites: [["d1", 9], ["d2", 3], ["d4", 2], ["d5", 4]],
    pending: ["Ministry comments on the highway corridors note", "NITI comments on draft swapping guidelines", "State consultation next month"],
    consult: [["p3", "Author of the charging handbook, now in Energy"], ["p2", "Owner of the highway corridors note"]],
    key: ["d1", "d4", "d5"]
  },
  "Managing Urbanisation": {
    topic: "City finance and governance",
    summary: [
      "The SMD has published an options paper on strengthening city governments {1}. A working note on municipal finance is in progress {2}.",
      "Recent State visits recorded demand for town planners and digitised master plans {3}; an earlier handover note lists pending urban data work {4}."
    ],
    cites: [["d19", 3], ["d18", 2], ["d20", 1], ["d21", 1]],
    pending: ["Minutes of the 5 Nov urban planning consultation", "Property tax pilot: State discussions", "City data standards with MoHUA"],
    consult: [["p4", "Owner of the city governments options paper"], ["p11", "Led the State visits and urban data work"], ["p8", "DMEO evaluation of an urban scheme"]],
    key: ["d19", "d18", "d21"]
  }
};

const SUGGESTED_QUESTIONS = [
  "What has NITI already done on battery swapping?",
  "Brief me on Managing Urbanisation's work and what is pending",
  "All reports on critical minerals since 2023",
  "Which Divisions have used PLFS data in their reports?"
];

const TOPICS = [
  "Electric mobility", "Critical minerals", "PLFS", "Municipal finance",
  "SDG localisation", "Maternal health", "Energy transition", "Research studies"
];

const PENDING_FOR_USER = {
  "Data Management & Analysis": [
    { text: "Approve user and access matrix for the pilot", due: "Due on 14 Nov" },
    { text: "Verify 3 uploads waiting in the Division queue", due: "Waiting since 6 Nov", link: "#/queue" }
  ],
  "Managing Urbanisation": [{ text: "Minutes of the 5 Nov urban planning consultation", due: "Due in 3 working days" }],
  "Research & Networking": [{ text: "Final report of the State capacity study", due: "Due on acceptance of milestone 3" }]
};

// Uploads waiting for the data steward (Verification queue)
const QUEUE = [
  { id: "q1", title: "Minutes: NDAP user group, October", division: "Data Management & Analysis", by: "p5", category: "C", access: "NITI-wide", date: "2026-11-06", note: "" },
  { id: "q2", title: "Dataset note: district GDP estimates", division: "Data Management & Analysis", by: "p5", category: "A", access: "Public", date: "2026-11-06", note: "Marked Public but not yet released. Check access level." },
  { id: "q3", title: "Scanned letter from a State department", division: "Data Management & Analysis", by: "p5", category: "C", access: "NITI-wide", date: "2026-11-07", note: "Held: classification screen found the word 'Confidential' on page 1.", held: true }
];
