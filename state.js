/*************************************************
 * DOM REFERENCES
 * (connect JavaScript to HTML elements)
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

// Temporary state while Add Topic form is open
let intervalValues = [];

// Persistent topics data (loaded from localStorage)
let topics = JSON.parse(localStorage.getItem("topics")) || [];

// Calendar UI state
let currentDate = new Date();
let selectedDate = null;


/*************************************************
 * DATA NORMALIZATION
 * (protects app from old / invalid data)
 *************************************************/
function normalizeTopic(topic) {
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: topic.id,
    title: topic.title,

    domain: topic.domain ?? null,
    notes: topic.notes ?? null,

    startDate: topic.startDate ?? today,
    intervals: Array.isArray(topic.intervals) ? topic.intervals : [],

    createdAt: topic.createdAt ?? today,
    updatedAt: topic.updatedAt ?? today
  };
}

// Normalize all topics on load
topics = topics.map(normalizeTopic);
localStorage.setItem("topics", JSON.stringify(topics));


/*************************************************
 * SETTINGS (defaults + user overrides)
 *************************************************/
const defaultSettings = {
  defaultIntervals: [3, 10, 30],
  defaultDomain: "",
};

let settings = JSON.parse(localStorage.getItem("settings")) || defaultSettings;

// Merge defaults with saved settings (user values override defaults)
settings = {
  ...defaultSettings,
  ...settings
};

localStorage.setItem("settings", JSON.stringify(settings));


/*************************************************
 * SETTINGS UI
 *************************************************/
function loadSettingsUI() {
  document.getElementById("defaultIntervalsInput").value =
    settings.defaultIntervals.join(",");

  document.getElementById("defaultDomainInput").value =
    settings.defaultDomain;
 
}

