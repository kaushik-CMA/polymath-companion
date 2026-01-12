/*************************************************
 * STATE DEBUG SWITCH
 * Flip to true ONLY when debugging state issues
 *************************************************/
const DEBUG_STATE = false;


/*************************************************
 * DOM REFERENCES (TEMPORARY)
 * NOTE: These should ideally live in ui-events.js
 * Kept here for now to avoid changing behavior
 *************************************************/
const addBtn = document.getElementById("addTopicBtn");
const form = document.getElementById("addTopicForm");
const saveBtn = document.getElementById("saveTopicBtn");
const cancelBtn = document.getElementById("cancelAddTopicBtn");

const input = document.getElementById("topicTitleInput");
const intervalNumberInput = document.getElementById("intervalNumberInput");
const intervalChipsDiv = document.getElementById("intervalChips");
const addIntervalBtn = document.getElementById("addIntervalBtn");
const domainInput = document.getElementById("topicDomainInput");

/* const domainValue =
  document.getElementById("topicDomainInput").value.trim();

const subDomainValue =
  domainValue
    ? document.getElementById("topicSubDomainInput").value.trim() || null
    : null;



/*************************************************
 * APPLICATION STATE
 *************************************************/

/**
 * Temporary state used while the "Add Topic" form is open.
 * This is NOT persisted.
 */
let intervalValues = [];

/**
 * Main persistent data store.
 * Loaded once from localStorage and shared across modules.
 */
let topics = JSON.parse(localStorage.getItem("topics")) || [];

/**
 * Calendar navigation state (UI-level state).
 */
let currentDate = new Date();
let selectedDate = null;

if (DEBUG_STATE) {
  console.log("[STATE] Initial topics loaded:", topics);
}


/*************************************************
 * DATA NORMALIZATION
 * Ensures backward compatibility & safe defaults
 *************************************************/
function normalizeTopic(topic) {
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: topic.id,
    title: topic.title,

    domain: topic.domain ?? null,
    subDomain: topic.subDomain ?? null,
    notes: topic.notes ?? null,

    startDate: topic.startDate ?? today,
    intervals: Array.isArray(topic.intervals)
      ? topic.intervals
      : [],

    createdAt: topic.createdAt ?? today,
    updatedAt: topic.updatedAt ?? today
  };
}

/**
 * Normalize all topics on load to protect against:
 * - old versions
 * - partial imports
 * - malformed JSON
 */
topics = topics.map(normalizeTopic);
localStorage.setItem("topics", JSON.stringify(topics));

if (DEBUG_STATE) {
  console.log("[STATE] Topics after normalization:", topics);
}


/*************************************************
 * SETTINGS STATE (defaults + overrides)
 *************************************************/

/**
 * Hard-coded defaults.
 * Never mutated directly.
 */
const defaultSettings = {
  defaultIntervals: [3, 10, 30],
  
};

/**
 * Load user settings (if any).
 */
let settings =
  JSON.parse(localStorage.getItem("settings")) || {};

/**
 * Merge defaults with user overrides.
 * User values ALWAYS win.
 */
settings = {
  ...defaultSettings,
  ...settings
};

localStorage.setItem("settings", JSON.stringify(settings));

if (DEBUG_STATE) {
  console.log("[STATE] Effective settings:", settings);
}


/*************************************************
 * SETTINGS UI SYNC
 * (Read-only sync from state → UI)
 *************************************************/
function loadSettingsUI() {
  document.getElementById("defaultIntervalsInput").value =
    settings.defaultIntervals.join(",");

}

/*************************************************
 * INTERVAL HISTORY CONFIG
 *************************************************/
const INTERVAL_HISTORY_KEY = "intervalHistory";
const INTERVAL_HISTORY_LIMIT = 3; // ← easy to change later

function getIntervalHistory() {
  return JSON.parse(localStorage.getItem("intervalHistory")) || [];
}


/*************************************************
 * PWA INSTALL HOOK
 * (Global, unavoidable side-effect)
 *************************************************/
const installBtn = document.getElementById("installBtn");

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    deferredPrompt = null;
    installBtn.style.display = "none";
  });
}

 // load sample data

  function generateSampleTopics() {
  const today = new Date();

  const d = offset =>
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + offset
    )
      .toISOString()
      .slice(0, 10);

  return [
    {
      id: crypto.randomUUID(),
      title: "Spaced repetition basics",
      domain: "Learning",
      subDomain: "Memory",
      notes: "Understand why reviewing at intervals works.",
      startDate: d(-7),
      intervals: [1, 3, 7, 21],
      createdAt: d(-7),
      updatedAt: d(-7)
    },
    {
      id: crypto.randomUUID(),
      title: "Binary Search",
      domain: "Programming",
      subDomain: "DSA",
      notes: "Search in sorted arrays in O(log n).",
      startDate: d(-3),
      intervals: [1, 4, 10, 30],
      createdAt: d(-3),
      updatedAt: d(-3)
    },
    {
      id: crypto.randomUUID(),
      title: "Chess openings",
      domain: "Chess",
      subDomain: "Openings",
      notes: "Italian Game, Ruy Lopez, Sicilian Defense.",
      startDate: d(0),
      intervals: [2, 7, 21, 60],
      createdAt: d(0),
      updatedAt: d(0)
    },
    {
      id: crypto.randomUUID(),
      title: "Time of Supply (GST)",
      domain: "Commerce",
      subDomain: "GST",
      notes: "Trigger point for tax liability.",
      startDate: d(2),
      intervals: [3, 10, 30],
      createdAt: d(2),
      updatedAt: d(2)
    },
    {
      id: crypto.randomUUID(),
      title: "System Design lifecycle",
      domain: "Technology",
      subDomain: "Architecture",
      notes: "Requirements → Design → Scale → Tradeoffs.",
      startDate: d(5),
      intervals: [7, 21, 60, 180],
      createdAt: d(5),
      updatedAt: d(5)
    }
  ];
}