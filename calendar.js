
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

  topicsForDay.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t.title;
    list.appendChild(li);
  });
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
