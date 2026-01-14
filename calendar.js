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
    const row = document.createElement("div");
    row.className = "calendar-topic-row";

    /* ---------- TITLE ---------- */
    const title = document.createElement("span");
    title.className = "calendar-topic-title";
    title.textContent = topic.title;
    title.addEventListener("click", () => {
      navigateToLibraryWithSearch(topic);
    });

    /* ---------- CONTROLS ---------- */
    const controls = document.createElement("div");
    controls.className = "calendar-inline-controls";

    const { prev, next } = getPrevNextRevision(topic, selectedDate);

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "◀";
    prevBtn.className = "secondary small";
    prevBtn.disabled = !prev;
    prevBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (prev) jumpToCalendarDate(prev);
    });

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "▶";
    nextBtn.className = "secondary small";
    nextBtn.disabled = !next;
    nextBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (next) jumpToCalendarDate(next);
    });

    controls.append(prevBtn, nextBtn);
    row.append(title, controls);
    list.appendChild(row);
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


/**************************
 * today page implementation
 **************************/

function renderTodayPage() {
  const today = new Date();
  today.setHours(0,0,0,0);

  const dateLabel = document.getElementById("todayDateLabel");
if (dateLabel) {
  dateLabel.textContent = today.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short"
  });
}
  const todayList = document.getElementById("todayList");
  if(!todayList) return;
  const yesterdayList = document.getElementById("yesterdayList");
  const tomorrowList = document.getElementById("tomorrowList");

  todayList.innerHTML = "";
  yesterdayList.innerHTML = "";
  tomorrowList.innerHTML = "";

  const topicsToday = getTopicsForDate(today);

topicsToday.forEach(topic => {
  todayList.appendChild(renderTodayItem(topic));
});

  if (!todayList.children.length)
    todayList.innerHTML = "<li class='muted'>No revisions today</li>";

  renderAdjacentDays();

}

function renderTodayItem(topic) {
  const li = document.createElement("li");
  li.className = "today-topic";
  li.classList.add("today-item");

  /* ===============================
     TITLE ROW (clickable)
  ================================ */
  const titleRow = document.createElement("div");
  titleRow.className = "today-title";

  const titleText = document.createElement("span");
  titleText.className = "today-title-text";
  titleText.textContent = topic.title;

  const linkIcon = document.createElement("img");
  linkIcon.src = "resources/finger-right-24.png";
  linkIcon.alt = "View in library";
  linkIcon.className = "today-link-icon";

  titleRow.append(titleText, linkIcon);

  titleRow.addEventListener("click", () => {
    navigateToLibraryWithSearch(topic);
  });

  li.appendChild(titleRow);

  /* ===============================
     FUTURE REVISION DATES
  ================================ */
  const strip = document.createElement("div");
  strip.className = "revision-strip";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDates = getSortedRevisionDates(topic)
    .filter(d => d > today);

  if (futureDates.length === 0) {
    const span = document.createElement("span");
    span.textContent = "Completed";
    span.style.opacity = "0.5";
    strip.appendChild(span);
  } else {
    futureDates.forEach(d => {
      const span = document.createElement("span");
      span.textContent = formatShortDate(d); // e.g. 13/01/26
      strip.appendChild(span);
    });
  }

  li.appendChild(strip);

  return li;
}

function formatShortDate(date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  });
}

function renderSimpleItem(topic) {
  const li = document.createElement("li");
  li.textContent = topic.title;
  li.className = "simple-link";
  li.onclick = () => navigateToLibraryWithSearch(topic);
  return li;
}

function renderAdjacentDays() {
  const yesterdayList = document.getElementById("yesterdayList");
  const tomorrowList = document.getElementById("tomorrowList");

  yesterdayList.innerHTML = "";
  tomorrowList.innerHTML = "";

  const today = new Date();
  today.setHours(0,0,0,0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  topics.forEach(topic => {
    const dates = getSortedRevisionDates(topic);

    dates.forEach(d => {
      d.setHours(0,0,0,0);

      if (d.getTime() === yesterday.getTime()) {
        yesterdayList.appendChild(createDayLink(topic));
      }

      if (d.getTime() === tomorrow.getTime()) {
        tomorrowList.appendChild(createDayLink(topic));
      }
    });
  });

  if (!yesterdayList.children.length) {
    yesterdayList.innerHTML = `<li class="muted">No revisions</li>`;
  }

  if (!tomorrowList.children.length) {
    tomorrowList.innerHTML = `<li class="muted">No revisions</li>`;
  }
}

function createDayLink(topic) {
  const li = document.createElement("li");
  li.className = "day-topic";
  li.textContent = topic.title;

  li.addEventListener("click", () => {
    navigateToLibraryWithSearch(topic);
  });

  return li;
}
