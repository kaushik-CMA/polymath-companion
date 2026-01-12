/*************************************************
 * UI EVENTS
 *
 * This file wires USER INTENT → APP ACTIONS
 *
 * Rule of thumb:
 * - No heavy logic here
 * - Mostly orchestration & delegation
 * - Business logic lives elsewhere
 *************************************************/

/*************************************************
 * ADD / EDIT TOPIC FLOW
 *************************************************/

// Open Add Topic form

addBtn.addEventListener("click", () => {
  // Show form
  form.style.display = "block";

  // ---------- Reset editing state ----------
  delete form.dataset.editingId;

  // ---------- Reset basic inputs ----------
  input.value = "";
  intervalNumberInput.value = "";
  document.getElementById("topicNotesInput").value = "";

  // ---------- Apply default intervals ----------
  intervalValues = [...settings.defaultIntervals];
  renderIntervalChips();
  renderIntervalHistory();

  // ---------- Reset domain ----------
  const domainInput =
    document.getElementById("topicDomainInput");
  domainInput.value = "";

  // ---------- Reset sub-domain ----------
  const subDomainInput =
    document.getElementById("topicSubDomainInput");

  subDomainInput.value = "";
  subDomainInput.disabled = true;
  subDomainInput.classList.add("disabled");

  // Clear sub-domain suggestions
  const subDomainDatalist =
    document.getElementById("subDomainSuggestions");
  if (subDomainDatalist) {
    subDomainDatalist.innerHTML = "";
  }

  // ---------- Set default start date ----------
  document.getElementById("topicStartDateInput").value =
    new Date().toISOString().slice(0, 10);
});


domainInput.addEventListener("input", () => {
  const subDomainInput =
    document.getElementById("topicSubDomainInput");
  if (!subDomainInput) return;

  const domain = domainInput.value.trim();

  if (!domain) {
    subDomainInput.value = "";
    subDomainInput.disabled = true;
    subDomainInput.classList.add("disabled-input");

    const datalist =
      document.getElementById("subDomainSuggestions");
    if (datalist) datalist.innerHTML = "";

    return;
  }

  subDomainInput.disabled = false;
  subDomainInput.classList.remove("disabled-input");

  populateSubDomainSuggestions(domain);
  renderIntervalHistory();
});

// Cancel Add Topic
cancelBtn.addEventListener("click", () => {
  form.style.display = "none";

  // Reset temporary form state
  intervalValues = [];
  renderIntervalChips();

  input.value = "";
  intervalNumberInput.value = "";
  document.getElementById("topicDomainInput").value = "";
  document.getElementById("topicNotesInput").value = "";
});

/*************************************************
 * SAVE TOPIC (ADD or EDIT)
 *************************************************/

saveBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const title = input.value.trim();
  if (!title || intervalValues.length === 0) return;

  const domainInput =
    document.getElementById("topicDomainInput").value.trim();

  const subDomainInput =
    document.getElementById("topicSubDomainInput").value.trim();

  const startDateInput =
    document.getElementById("topicStartDateInput").value;

  const notesInput =
    document.getElementById("topicNotesInput").value.trim();

  const today = new Date().toISOString().slice(0, 10);
  const editingId = form.dataset.editingId;

  // 🔑 CAPTURE intervals BEFORE mutation
  const savedIntervals = [...intervalValues];

  if (editingId) {
    const index = topics.findIndex(t => t.id === editingId);

    topics[index] = {
      ...topics[index],
      title,
      domain: domainInput || null,
      subDomain: subDomainInput || null,
      notes: notesInput || null,
      startDate: startDateInput || today,
      intervals: savedIntervals,
      updatedAt: today
    };

    delete form.dataset.editingId;
  } else {
    topics.push({
      id: crypto.randomUUID(),
      title,
      domain: domainInput || null,
      subDomain: subDomainInput || null,
      notes: notesInput || null,
      startDate: startDateInput || today,
      intervals: savedIntervals,
      createdAt: today,
      updatedAt: today
    });
  }

  // ===== PERSIST =====
  localStorage.setItem("topics", JSON.stringify(topics));

  // 🔑 UPDATE INTERVAL HISTORY (correct timing)
  updateIntervalHistory(savedIntervals);
  renderIntervalHistory();

  // ===== CLEANUP UI STATE =====
  intervalValues = [];
  renderIntervalChips();
  form.style.display = "none";

  // ===== RE-RENDER =====
  renderLibrary();
  renderCalendar();
  renderSelectedDate();
  renderDashboard();
  populateDomainFilter();
  populateDomainSuggestions();
});

/*************************************************
 * CALENDAR NAVIGATION
 *************************************************/

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

todayBtn.addEventListener("click", () => {
  const today = new Date();

  currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  selectedDate = currentDate;

  renderCalendar();
  renderSelectedDate();
});

/*************************************************
 * LIBRARY FILTERS & SEARCH
 *************************************************/

document.getElementById("domainFilter")
  .addEventListener("change", renderLibrary);

document.getElementById("sortBy")
  .addEventListener("change", renderLibrary);

document.getElementById("librarySearchInput")
  .addEventListener("input", renderLibrary);

document
  .querySelectorAll('input[name="status"]')
  .forEach(radio => {
    radio.addEventListener("change", renderLibrary);
  });

// Clear filters & restore defaults
document
  .getElementById("clearLibraryFilters")
  .addEventListener("click", () => {

    document.querySelectorAll('input[name="status"]').forEach(r => {
      r.checked = r.value === "active";
    });

    document.getElementById("domainFilter").value = "";
    document.getElementById("librarySearchInput").value = "";
    document.getElementById("sortBy").value = "title-asc";

    renderLibrary();
  });

  /*************************************************
 * LIBRARY FILTER TOGGLE (UI STATE)
 *************************************************/

let filtersExpanded = false;

const toggleBtn = document.getElementById("toggleFiltersBtn");

toggleBtn.addEventListener("click", () => {
  filtersExpanded = !filtersExpanded;

  const filtersBody = document.querySelector(".filters-body");
  filtersBody.classList.toggle("expanded", filtersExpanded);

  toggleBtn.textContent =
    filtersExpanded ? "Hide filters" : "Show filters";
});

/*************************************************
 * MAIN NAVIGATION
 *************************************************/

document.getElementById("mainNav").addEventListener("click", e => {
  if (e.target.tagName !== "BUTTON") return;
  showView(e.target.dataset.view);
});

/*************************************************
 * IMPORT / EXPORT
 *************************************************/

// Export data
document.getElementById("exportBtn")
  .addEventListener("click", () => {
    const data = JSON.stringify(topics, null, 2);
    const blob = new Blob([data], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "polymath-companion-data.json";
    a.click();
    URL.revokeObjectURL(url);
  });

// Import data
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

        topics = imported.map(normalizeTopic);
        localStorage.setItem("topics", JSON.stringify(topics));

        renderCalendar();
        renderSelectedDate();
        populateDomainFilter();
        populateDomainSuggestions();
        renderLibrary();
        renderDashboard();

        alert("Import successful.");
      } catch {
        alert("Failed to import file.");
      }
    };

    reader.readAsText(file);
  });

  /*************************************************
 * SETTINGS
 *************************************************/

document.getElementById("saveSettingsBtn")
  .addEventListener("click", () => {
    const intervalsRaw =
      document.getElementById("defaultIntervalsInput").value;

    const parsedIntervals = intervalsRaw
      .split(",")
      .map(v => parseInt(v.trim()))
      .filter(v => !isNaN(v) && v > 0);

    settings.defaultIntervals =
      parsedIntervals.length
        ? parsedIntervals
        : defaultSettings.defaultIntervals;


    localStorage.setItem("settings", JSON.stringify(settings));
    alert("Settings saved.");
  });

/*************************************************
 * sub domain availability
 *************************************************/
//const domainInput = document.getElementById("topicDomainInput");

domainInput.addEventListener("input", () => {
  const subDomainInput =
    document.getElementById("topicSubDomainInput");
  if (!subDomainInput) return;

  const domain = domainInput.value.trim();

  if (!domain) {
    subDomainInput.value = "";
    subDomainInput.disabled = true;
    subDomainInput.classList.add("disabled");

    const datalist =
      document.getElementById("subDomainSuggestions");
    if (datalist) datalist.innerHTML = "";

    return;
  }

  subDomainInput.disabled = false;
  subDomainInput.classList.remove("disabled");

  populateSubDomainSuggestions(domain);
});