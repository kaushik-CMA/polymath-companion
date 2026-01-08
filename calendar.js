let libraryStatusOverride = null;
/*************************************************
 * CALENDAR + REVISION LOGIC
 *************************************************/
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
      revisions.push({ date: d, topic });
    });
  });

  return revisions;
}

function hasRevisionOnDate(date) {
  return getAllRevisions().some(r =>
    r.date.toDateString() === date.toDateString()
  );
}

function getTopicsForDate(date) {
  return getAllRevisions()
    .filter(r => r.date.toDateString() === date.toDateString())
    .map(r => r.topic);
}

function getLastRevisionDate(topic) {
  const dates = getSortedRevisionDates(topic); // MUST return Date objects

  if (!dates || dates.length === 0) return null;

  return dates[dates.length - 1];
}

function isTopicCompleted(topic) {
  const last = getLastRevisionDate(topic);
  if (!last) return false; // 👈 VERY IMPORTANT

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return last < today;
}


function getSortedRevisionDates(topic) {
  return topic.intervals
    .map(days => addDays(topic.startDate, days))
    .sort((a, b) => a - b);
}

function getPrevNextRevision(topic, referenceDate) {
  const dates = getSortedRevisionDates(topic);

  let prev = null;
  let next = null;

  for (let d of dates) {
    if (d < referenceDate) prev = d;
    if (d > referenceDate && !next) next = d;
  }

  return { prev, next };
}

function navigateToLibrary(topicId, mode) {
  showView("library");

  libraryStatusOverride = mode;
  window.highlightTopicId = topicId;

  // 🔑 CLEAR OTHER FILTERS
  document.getElementById("domainFilter").value = "";
  const search = document.getElementById("librarySearch");
  if (search) search.value = "";
  renderLibrary();
}

function navigateToLibraryWithSearch(topic) {
  showView("library");

  // Determine correct classification
  const statusValue = isTopicCompleted(topic)
    ? "completed"
    : "active";

  // Set classification radio
  document.querySelectorAll('input[name="status"]').forEach(r => {
    r.checked = r.value === statusValue;
  });

  // Clear domain filter
  document.getElementById("domainFilter").value = "";

  // Set search value
  const searchInput = document.getElementById("librarySearchInput");
  searchInput.value = topic.title;

  renderLibrary();
}
/*************************************************
 * CALENDAR RENDERING
 *************************************************/
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
    grid.appendChild(document.createElement("div"));
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

  list.innerHTML = "";

  const topicsForDay = getTopicsForDate(selectedDate);

  if (topicsForDay.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No topics scheduled for this day.";
    li.style.opacity = "0.6";
    list.appendChild(li);
    return;
  }

 topicsForDay.forEach(topic => {
  const li = document.createElement("li");

  // Title (clickable)
  const title = document.createElement("span");
  title.textContent = topic.title;
  title.className = "calendar-topic-title";
  title.addEventListener("click", () => {
  navigateToLibraryWithSearch(topic);
});


  // Domain (plain text)
  const domain = document.createElement("span");
  domain.textContent = topic.domain ? ` [${topic.domain}]` : "";
  domain.className = "calendar-topic-domain";

  li.appendChild(title);
  li.appendChild(domain);

  /* ---------- Control buttons ---------- */
  const controls = document.createElement("div");
  controls.className = "calendar-controls";

  const { prev, next } = getPrevNextRevision(topic, selectedDate);

  if (prev) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.className = "secondary small";
    prevBtn.addEventListener("click", () => {
      jumpToCalendarDate(prev);
    });
    controls.appendChild(prevBtn);
  }

  if (next) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.className = "secondary small";
    nextBtn.addEventListener("click", () => {
      jumpToCalendarDate(next);
    });
    controls.appendChild(nextBtn);
  }

  if (controls.children.length > 0) {
    li.appendChild(controls);
  }

  list.appendChild(li);
});
}

function jumpToCalendarDate(date) {
  selectedDate = new Date(date);

  currentDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  );

  renderCalendar();
  renderSelectedDate();
}
/*************************************************
 * DASHBOARD
 *************************************************/
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
