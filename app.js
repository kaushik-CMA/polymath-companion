const addBtn = document.getElementById("addTopicBtn");
const form = document.getElementById("addTopicForm");
const saveBtn = document.getElementById("saveTopicBtn");
const input = document.getElementById("topicTitleInput");
const intervalChipsDiv = document.getElementById("intervalChips");
const intervalNumberInput = document.getElementById("intervalNumberInput");

let intervalValues = [];
const list = document.getElementById("topicList");

let topics = JSON.parse(localStorage.getItem("topics")) || [];

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

function renderTopics() {
  list.innerHTML = "";
  topics.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.title} → [${t.intervals.join(", ")}]`;
    list.appendChild(li);
  });
}

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

//helper function end here

addBtn.addEventListener("click", () => {
  form.style.display = "block";
});

saveBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const title = input.value.trim();

  if (!title) return;
  if (intervalValues.length === 0) return;

  const topic = {
    id: crypto.randomUUID(),
    title: title,
    intervals: [...intervalValues],
    startDate: new Date().toISOString().slice(0, 10)
  };

 
  topics.push(topic);
  localStorage.setItem("topics", JSON.stringify(topics));
  intervalValues = [];
  renderIntervalChips();

  input.value = "";
  intervalNumberInput.value = "";
  form.style.display = "none";

  renderTopics();
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

renderTopics();
renderCalendar();
renderSelectedDate();
