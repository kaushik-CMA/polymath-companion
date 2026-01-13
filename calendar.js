/*************************************************
 * CALENDAR STATE COORDINATION
 *************************************************/

// Used when calendar redirects to library
let libraryStatusOverride = null;


/*************************************************
 * DATE & REVISION UTILITIES
 * (pure logic — no DOM)
 *************************************************/

// Add N days to a date (returns new Date)
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Return sorted revision dates for a topic
function getSortedRevisionDates(topic) {
  return topic.intervals
    .map(days => addDays(topic.startDate, days))
    .sort((a, b) => a - b);
}

// Last scheduled revision date
function getLastRevisionDate(topic) {
  const dates = getSortedRevisionDates(topic);
  return dates.length ? dates[dates.length - 1] : null;
}

// Whether topic has completed all revisions
function isTopicCompleted(topic) {
  const last = getLastRevisionDate(topic);
  if (!last) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return last < today;
}

// Previous / next revision relative to a date
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


/*************************************************
 * REVISION LOOKUPS (across all topics)
 *************************************************/

// Flatten all revisions into [{ date, topic }]
function getAllRevisions() {
  const revisions = [];

  topics.forEach(topic => {
    getSortedRevisionDates(topic).forEach(date => {
      revisions.push({ date, topic });
    });
  });

  return revisions;
}

// Whether any revision exists on given date
function hasRevisionOnDate(date) {
  return getAllRevisions().some(r =>
    r.date.toDateString() === date.toDateString()
  );
}

// Topics scheduled for a given date
function getTopicsForDate(date) {
  return getAllRevisions()
    .filter(r => r.date.toDateString() === date.toDateString())
    .map(r => r.topic);
}


/*************************************************
 * CALENDAR UI RENDERING
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
  const todayStr = new Date().toDateString();

  // Leading empty cells
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

    if (cellDate.toDateString() === todayStr) {
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

    const title = document.createElement("span");
    title.textContent = topic.title;
    title.className = "calendar-topic-title";
    title.addEventListener("click", () => {
      navigateToLibraryWithSearch(topic);
    });

    const domain = document.createElement("span");
    domain.textContent = topic.domain ? ` [${topic.domain}]` : "";
    domain.className = "calendar-topic-domain";

    const subDomain = document.createElement("span");
    subDomain.textContent = topic.subDomain ? `> ${topic.subDomain}` : "";
    subDomain.className = "calendar-topic-domain";

    li.appendChild(title);
    li.appendChild(domain);
    li.appendChild(subDomain);

    const controls = document.createElement("div");
    controls.className = "calendar-controls";

    const { prev, next } = getPrevNextRevision(topic, selectedDate);

    if (prev) {
      const btn = document.createElement("button");
      btn.textContent = "Prev";
      btn.className = "secondary small";
      btn.onclick = () => jumpToCalendarDate(prev);
      controls.appendChild(btn);
    }

    if (next) {
      const btn = document.createElement("button");
      btn.textContent = "Next";
      btn.className = "secondary small";
      btn.onclick = () => jumpToCalendarDate(next);
      controls.appendChild(btn);
    }

    if (controls.children.length) li.appendChild(controls);

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

// today main

function renderToday() {
  const header = document.getElementById("todayHeader");
  const list = document.getElementById("todayList");

  if (!header || !list) return;

  const today = new Date();
  const todayStr = today.toDateString();

  header.textContent =
    "Today · " +
    today.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short"
    });

  list.innerHTML = "";

  const topicsToday = getTopicsForDate(today);

  if (topicsToday.length === 0) {
    const li = document.createElement("li");
    li.textContent =
      "Nothing scheduled today. Review freely or add something new.";
    li.style.opacity = "0.7";
    list.appendChild(li);
    return;
  }

  topicsToday.forEach(topic => {
    const li = document.createElement("li");

    const title = document.createElement("strong");
    title.textContent = topic.title;

    const meta = document.createElement("div");
    meta.textContent =
      `${topic.domain ?? ""}${topic.subDomain ? " › " + topic.subDomain : ""}`;
    meta.style.opacity = "0.7";

    const actions = document.createElement("div");

    const calBtn = document.createElement("button");
    calBtn.textContent = "View in calendar";
    calBtn.className = "secondary small";
    calBtn.onclick = () => jumpToCalendarDate(today);

    const libBtn = document.createElement("button");
    libBtn.textContent = "View in library";
    libBtn.className = "secondary small";
    libBtn.onclick = () => navigateToLibraryWithSearch(topic);

    actions.appendChild(calBtn);
    actions.appendChild(libBtn);

    li.appendChild(title);
    li.appendChild(meta);
    li.appendChild(actions);

    list.appendChild(li);
  });
}