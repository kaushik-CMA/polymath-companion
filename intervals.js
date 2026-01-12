/*************************************************
 * INTERVAL DEBUG SWITCH
 * Enable only when debugging interval behavior
 *************************************************/
const DEBUG_INTERVALS = false;


/*************************************************
 * INTERVAL CHIP RENDERING
 * Reflects current intervalValues[] in the UI
 *************************************************/
function renderIntervalChips() {
  // Clear existing chips
  intervalChipsDiv.innerHTML = "";

  // Render each interval as a removable chip
  intervalValues.forEach((val, index) => {
    const chip = document.createElement("div");
    chip.className = "interval-chip";

    // The × span carries the index for removal
    chip.innerHTML = `${val} <span data-index="${index}">×</span>`;

    intervalChipsDiv.appendChild(chip);
  });

  if (DEBUG_INTERVALS) {
    console.log("[INTERVALS] Rendered chips:", intervalValues);
  }
}


/*************************************************
 * CHIP REMOVAL (EVENT DELEGATION)
 *************************************************/
intervalChipsDiv.addEventListener("click", (e) => {
  if (e.target.tagName !== "SPAN") return;

  const index = Number(e.target.dataset.index);

  // Remove interval at clicked index
  intervalValues.splice(index, 1);

  if (DEBUG_INTERVALS) {
    console.log("[INTERVALS] Removed index:", index);
  }

  renderIntervalChips();
});


/*************************************************
 * ADD INTERVAL — KEYBOARD
 * Enter key adds the interval
 *************************************************/
intervalNumberInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  e.preventDefault();
  addInterval();
});


/*************************************************
 * ADD INTERVAL — BUTTON
 *************************************************/
addIntervalBtn.addEventListener("click", addInterval);


/*************************************************
 * CORE ADD INTERVAL LOGIC
 *************************************************/
function addInterval() {
  const val = parseInt(intervalNumberInput.value, 10);

  // Basic validation:
  // - must be a number
  // - must be positive
  // - must be unique
  if (!isNaN(val) && val > 0 && !intervalValues.includes(val)) {
    intervalValues.push(val);

    // Keep intervals sorted for predictable behavior
    intervalValues.sort((a, b) => a - b);

    if (DEBUG_INTERVALS) {
      console.log("[INTERVALS] Added:", val);
    }

    renderIntervalChips();
  }

  // Always clear input after attempt
  intervalNumberInput.value = "";
}

// recent user intervals
function loadIntervalHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(INTERVAL_HISTORY_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveIntervalHistory(history) {
  localStorage.setItem(
    INTERVAL_HISTORY_KEY,
    JSON.stringify(history)
  );
}

// load recent interval helper function
function updateIntervalHistory(intervals) {
  let history =
    JSON.parse(localStorage.getItem("intervalHistory"));

  if (!Array.isArray(history)) history = [];

  // ignore exact duplicates
  const exists = history.some(h =>
    h.length === intervals.length &&
    h.every((v, i) => v === intervals[i])
  );
  if (exists) return;

  // cap length (example: 3)
  if (history.length >= 3) history.shift();

  history.push([...intervals]);

  localStorage.setItem(
    "intervalHistory",
    JSON.stringify(history)
  );
}


function renderIntervalHistory() {
  const container = document.getElementById("intervalHistory");
  if (!container) return;

  let history = JSON.parse(localStorage.getItem("intervalHistory"));

  // 🔑 HARD NORMALIZATION
  if (!Array.isArray(history)) {
    history = [];
    localStorage.setItem(
      "intervalHistory",
      JSON.stringify(history)
    );
  }

  container.innerHTML = "";
  container.classList.remove("disabled");

  if (history.length === 0) {
    container.classList.add("disabled");
    container.textContent =
      "Recent interval sets will appear here";
    return;
  }

  history.forEach(set => {
    const chip = document.createElement("button");
    chip.className = "interval-chip secondary";
    chip.textContent = set.join(", ");

    chip.onclick = () => {
      intervalValues = [...set];
      renderIntervalChips();
    };

    container.appendChild(chip);
  });
}