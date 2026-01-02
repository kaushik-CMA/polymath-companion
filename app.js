const addBtn = document.getElementById("addTopicBtn");
const form = document.getElementById("addTopicForm");
const saveBtn = document.getElementById("saveTopicBtn");
const input = document.getElementById("topicTitleInput");
const intervalChipsDiv = document.getElementById("intervalChips");
const intervalNumberInput = document.getElementById("intervalNumberInput");
const addIntervalBtn = document.getElementById("addIntervalBtn");
const cancelBtn = document.getElementById("cancelAddTopicBtn");

cancelBtn.addEventListener("click", () => {
  form.style.display = "none";

  // reset temporary state
  intervalValues = [];
  renderIntervalChips();

  input.value = "";
  intervalNumberInput.value = "";
  document.getElementById("topicDomainInput").value = "";
  document.getElementById("topicNotesInput").value = "";
});



let intervalValues = [];  

let topics = JSON.parse(localStorage.getItem("topics")) || [];

topics = topics.map(normalizeTopic);

const defaultSettings = {
  defaultIntervals: [3, 10, 30],
  defaultDomain: "",
};

let settings = JSON.parse(localStorage.getItem("settings")) || defaultSettings; 

settings = {
  ...defaultSettings,
  ...settings
};

localStorage.setItem("settings", JSON.stringify(settings)); 

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
//normalisation
localStorage.setItem("topics", JSON.stringify(topics));


function renderIntervalChips() {
  intervalChipsDiv.innerHTML = "";

  intervalValues.forEach((val, index) => {
    const chip = document.createElement("div");
    chip.className = "interval-chip";
    chip.innerHTML = `${val} <span data-index="${index}">×</span>`;
    intervalChipsDiv.appendChild(chip);
  });
}

intervalChipsDiv.addEventListener("click", (e) => {
  if (e.target.tagName === "SPAN") {
    const index = Number(e.target.dataset.index);
    intervalValues.splice(index, 1);
    renderIntervalChips();
  }
});

intervalNumberInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const val = parseInt(intervalNumberInput.value);

    if (!isNaN(val) && val > 0 && !intervalValues.includes(val)) {
      intervalValues.push(val);
      intervalValues.sort((a, b) => a - b);
      renderIntervalChips();
    }

    intervalNumberInput.value = "";
  }
});

/*function renderTopics() {
  list.innerHTML = "";
  topics.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.title} → [${t.intervals.join(", ")}]`;
    list.appendChild(li);
  });
} not required now */

let currentDate = new Date();
let selectedDate = null;

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  const title = document.getElementById("calendarTitle");

  title.textContent = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  grid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toDateString();

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    grid.appendChild(empty);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const cell = document.createElement("div");

    cell.className = "calendar-day";
    cell.textContent = day;

    if (hasRevisionOnDate(cellDate)) {
    const dot = document.createElement("div");
    dot.className = "calendar-dot";
    cell.appendChild(dot);
    }


    if (cellDate.toDateString() === today) {
      cell.classList.add("today");
    }

    cell.addEventListener("click", () => {
  selectedDate = cellDate;
  renderCalendar();
  renderSelectedDate();
});

if (
  selectedDate &&
  cellDate.toDateString() === selectedDate.toDateString()
) {
  cell.style.background = "#cce5ff";
}

grid.appendChild(cell);

  }
}

function renderSelectedDate() {
  const header = document.getElementById("selectedDateHeader");
  const list = document.getElementById("selectedDateTopics");

  if (!selectedDate) {
    header.textContent = "";
    list.innerHTML = "";
    return;
  }

  header.textContent =
    "Topics for " + selectedDate.toDateString();

  const topicsForDay = getTopicsForDate(selectedDate);

  list.innerHTML = "";

if (topicsForDay.length === 0) {
  const li = document.createElement("li");
  li.textContent = "No topics scheduled for this day.";
  li.style.opacity = "0.6";
  list.appendChild(li);
  return;
}

topicsForDay.forEach(t => {
  const li = document.createElement("li");
  li.textContent = t.title;
  list.appendChild(li);
});
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getRevisionDates(topic) {
  return topic.intervals.map(days =>
    addDays(topic.startDate, days)
  );
}

function getAllRevisions() {
  const revisions = [];

  topics.forEach(topic => {
    const dates = getRevisionDates(topic);
    dates.forEach(d => {
      revisions.push({
        date: d,
        topic: topic
      });
    });
  });

  return revisions;
}

/*{
  date: Date,
  topic: { ... }
}*/

function hasRevisionOnDate(date) {
  const revisions = getAllRevisions();

  return revisions.some(r =>
    r.date.toDateString() === date.toDateString()
  );
}

function getTopicsForDate(date) {
  const revisions = getAllRevisions();

  return revisions
    .filter(r => r.date.toDateString() === date.toDateString())
    .map(r => r.topic);
}

function populateDomainFilter() {
  const select = document.getElementById("domainFilter");

  const domains = Array.from(
    new Set(topics.map(t => t.domain).filter(Boolean))
  );

  select.innerHTML = `<option value="">All domains</option>`;

  domains.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });

  console.log(
  "Domains in topics:",
  topics.map(t => t.domain)
);

}

function renderLibrary() {
  const list = document.getElementById("libraryList");
  const domain = document.getElementById("domainFilter").value;
  const sortBy = document.getElementById("sortBy").value;

  let filtered = [...topics];

  if (domain) {
    filtered = filtered.filter(t => t.domain === domain);
  }

  if (sortBy === "title") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortBy === "startDate") {
    filtered.sort((a, b) =>
      new Date(a.startDate) - new Date(b.startDate)
    );
  }

  list.innerHTML = "";

  filtered.forEach(t => {
  const li = document.createElement("li");

  const header = document.createElement("div");
  header.textContent =
    `${t.title} | ${t.domain ?? "—"} | ${t.startDate} | [${t.intervals.join(", ")}]`;

  li.appendChild(header);

  if (t.notes) {
    const toggle = document.createElement("button");
    toggle.textContent = "View notes";
    toggle.className = "secondary";

    const notesDiv = document.createElement("div");
    notesDiv.textContent = t.notes;
    notesDiv.style.display = "none";
    notesDiv.style.marginTop = "6px";
    notesDiv.style.opacity = "0.8";

    toggle.addEventListener("click", () => {
      const isHidden = notesDiv.style.display === "none";
      notesDiv.style.display = isHidden ? "block" : "none";
      toggle.textContent = isHidden ? "Hide notes" : "View notes";
    });

    li.appendChild(toggle);
    li.appendChild(notesDiv);
  }

  list.appendChild(li);
});

}

function exportData() {
  const data = JSON.stringify(topics, null, 2);
  const blob = new Blob([data], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "polymath-companion-data.json";
  a.click();

  URL.revokeObjectURL(url);
}

function loadSettingsUI() {
  document.getElementById("defaultIntervalsInput").value =
    settings.defaultIntervals.join(",");

  document.getElementById("defaultDomainInput").value =
    settings.defaultDomain;
}

function populateDomainSuggestions() {
  const datalist = document.getElementById("domainSuggestions");

  const domains = Array.from(
    new Set(topics.map(t => t.domain).filter(Boolean))
  );

  datalist.innerHTML = "";

  domains.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    datalist.appendChild(opt);
  });
}

function renderDashboard() {
  const el = document.getElementById("dashboard");

  const today = new Date();
  const todayStr = today.toDateString();

  const allRevisions = getAllRevisions();

  const todayCount = allRevisions.filter(r =>
    r.date.toDateString() === todayStr
  ).length;

  const upcomingCount = allRevisions.filter(r => {
    const diff = (r.date - today) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 7;
  }).length;

  el.innerHTML = `
    <li>Total topics: ${topics.length}</li>
    <li>Revisions today: ${todayCount}</li>
    <li>Upcoming (7 days): ${upcomingCount}</li>
  `;
}

function addInterval() {
  const val = parseInt(intervalNumberInput.value);

  if (!isNaN(val) && val > 0 && !intervalValues.includes(val)) {
    intervalValues.push(val);
    intervalValues.sort((a, b) => a - b);
    renderIntervalChips();
  }

  intervalNumberInput.value = "";
}

//helper function end here

addBtn.addEventListener("click", () => {
  form.style.display = "block";

  intervalValues = [...settings.defaultIntervals];
  renderIntervalChips();

  document.getElementById("topicDomainInput").value =
    settings.defaultDomain || "";

  document.getElementById("topicStartDateInput").value =
    new Date().toISOString().slice(0, 10);

  document.getElementById("topicNotesInput").value = "";
});

saveBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const domainInput =
  document.getElementById("topicDomainInput").value.trim();

const startDateInput =
  document.getElementById("topicStartDateInput").value;

const notesInput =
  document.getElementById("topicNotesInput").value.trim();


  const title = input.value.trim();

  if (!title) return;
  if (intervalValues.length === 0) return;

  const today = new Date().toISOString().slice(0, 10);

const topic = {
  id: crypto.randomUUID(),
  title: title,

  domain: domainInput || null,
  notes: notesInput || null,

  startDate: startDateInput || today,
  intervals: [...intervalValues],

  createdAt: today,
  updatedAt: today
};

 
  topics.push(topic);
  localStorage.setItem("topics", JSON.stringify(topics));
  intervalValues = [];
  renderIntervalChips();

  input.value = "";
  intervalNumberInput.value = "";
  form.style.display = "none";

 // renderTopics();
});

document.getElementById("prevMonthBtn")
  .addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

document.getElementById("nextMonthBtn")
  .addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });
document.getElementById("domainFilter")
  .addEventListener("change", renderLibrary);

document.getElementById("sortBy")
  .addEventListener("change", renderLibrary);

document.getElementById("exportBtn")
  .addEventListener("click", exportData);

document.getElementById("importInput")
  .addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);

        if (!Array.isArray(imported)) {
          alert("Invalid file format.");
          return;
        }

        // 🔒 Replace-all strategy
        topics = imported.map(normalizeTopic);

        localStorage.setItem("topics", JSON.stringify(topics));

        // re-render everything
       // renderTopics();
        renderCalendar();
        renderSelectedDate();
        populateDomainFilter();
        renderLibrary();

        alert("Import successful.");
      } catch {
        alert("Failed to import file.");
      }
    };

    reader.readAsText(file);
  });

document.getElementById("saveSettingsBtn")
  .addEventListener("click", () => {
    const intervalsRaw =
      document.getElementById("defaultIntervalsInput").value;

    const parsedIntervals = intervalsRaw
      .split(",")
      .map(v => parseInt(v.trim()))
      .filter(v => !isNaN(v) && v > 0);

    settings.defaultIntervals =
      parsedIntervals.length ? parsedIntervals : defaultSettings.defaultIntervals;

    settings.defaultDomain =
      document.getElementById("defaultDomainInput").value.trim();

    localStorage.setItem("settings", JSON.stringify(settings));

    alert("Settings saved.");
  });

    addIntervalBtn.addEventListener("click", addInterval);


loadSettingsUI();

populateDomainFilter();
populateDomainSuggestions();

renderLibrary();
renderCalendar();
renderSelectedDate();
renderDashboard();
