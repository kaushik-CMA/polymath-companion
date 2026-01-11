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
  defaultDomain: ""
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

  document.getElementById("defaultDomainInput").value =
    settings.defaultDomain;
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