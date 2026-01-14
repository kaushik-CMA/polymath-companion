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
 * SUB-DOMAIN AVAILABILITY SYNC
 *************************************************/
function syncSubDomainAvailability() {
  const domainInput =
    document.getElementById("topicDomainInput");
  const subDomainInput =
    document.getElementById("topicSubDomainInput");

  if (!domainInput || !subDomainInput) return;

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
}

/*************************************************
 * ADD / EDIT TOPIC FLOW
 *************************************************/

// Open Add Topic form

function updateSubDomainState() {
  const hasDomain = topicDomainInput.value.trim().length > 0;
  topicSubDomainInput.disabled = !hasDomain;
  topicSubDomainInput.classList.toggle("disabled-input", !hasDomain);
}

addBtn.addEventListener("click", () => {
  // Show form
  form.style.display = "block";

  // ---------- Reset editing state ----------
  delete form.dataset.editingId;

  // ---------- Reset basic inputs ----------
  input.value = "";
  intervalNumberInput.value = "";
  document.getElementById("topicNotesInput").innerHTML = "";

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


domainInput.addEventListener("input", updateSubDomainState)

// Cancel Add Topic
cancelBtn.addEventListener("click", () => {
  form.style.display = "none";

  // Reset temporary form state
  intervalValues = [];
  renderIntervalChips();

  input.value = "";
  intervalNumberInput.value = "";
  document.getElementById("topicDomainInput").value = "";
  document.getElementById("topicNotesInput").innerHTML = "";
});

/*************************************************
 * SAVE TOPIC (ADD or EDIT)
 *************************************************/

saveBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const title = input.value.trim();
  if (!title || intervalValues.length === 0) return;

  const domain =
    document.getElementById("topicDomainInput").value.trim();

  const subDomain =
    domain
      ? document.getElementById("topicSubDomainInput").value.trim() || null
      : null;

  const startDate =
    document.getElementById("topicStartDateInput").value;

  const notes =
    document.getElementById("topicNotesInput").innerHTML.trim();

  const today = new Date().toISOString().slice(0, 10);
  const editingId = form.dataset.editingId;

  const intervalsSnapshot = [...intervalValues]; // 🔑 CRITICAL

  if (editingId) {
    const index = topics.findIndex(t => t.id === editingId);
    topics[index] = {
      ...topics[index],
      title,
      domain: domain || null,
      subDomain,
      notes: notes || null,
      startDate: startDate || today,
      intervals: intervalsSnapshot,
      updatedAt: today
    };
    delete form.dataset.editingId;
  } else {
    topics.push({
      id: crypto.randomUUID(),
      title,
      domain: domain || null,
      subDomain,
      notes: notes || null,
      startDate: startDate || today,
      intervals: intervalsSnapshot,
      createdAt: today,
      updatedAt: today
    });
  }

  // 🔒 Update history BEFORE clearing
  updateIntervalHistory(intervalsSnapshot);

  // persist topics
  localStorage.setItem("topics", JSON.stringify(topics));

  // reset UI state
  intervalValues = [];
  renderIntervalChips();
  form.style.display = "none";

  // re-render
  renderLibrary();
  renderCalendar();
  renderSelectedDate();
  populateDomainFilter();
  populateDomainSuggestions();
  renderIntervalHistory(); // UI-only function
  renderToday();
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

document.getElementById("bottomNav").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;

  showView(btn.dataset.view);
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

    alert("Default intervals saved.");
  });
  
  
  // feedback 
  const feedbackBtn = document.getElementById("feedbackBtn");

if (feedbackBtn) {
  feedbackBtn.addEventListener("click", () => {
    const subject = encodeURIComponent("Polymath Companion – Feedback");
    const body = encodeURIComponent(
      "Hi,\n\nI would like to share the following feedback:\n\n"
    );

    window.location.href =
      `mailto:kaushikgauns@gmail.com?subject=${subject}&body=${body}`;
  });
}

// rate on play store link
const rateApp = document.getElementById("rateApp");

if (rateApp) {
  rateApp.addEventListener("click", () => {
    alert("Thanks for using Polymath Companion 🙂");
  });
} 

//clear data with confirmation box

document.getElementById("clearDataBtn")
  .addEventListener("click", () => {

    const confirmed = confirm(
      "This will permanently delete ALL topics and settings from this device.\n\nThis action cannot be undone.\n\nDo you want to continue?"
    );

    if (!confirmed) return;

    // Clear storage
    localStorage.removeItem("topics");
    localStorage.removeItem("settings");
    localStorage.removeItem("intervalHistory");

    // Reset in-memory state
    topics = [];
    intervalValues = [];

    // Re-render UI
    renderLibrary();
    renderCalendar();
    renderSelectedDate();
    populateDomainFilter();
    populateDomainSuggestions();

    alert("All data has been cleared.");
  });

  // notes formatting
  document.addEventListener("click", e => {
  const btn = e.target.closest("[data-cmd]");
  if (!btn) return;

  const cmd = btn.dataset.cmd;
  document.execCommand(cmd, false, null);
});

document
  .getElementById("expandAllBtn")
  ?.addEventListener("click", expandAllTopics);

document
  .getElementById("collapseAllBtn")
  ?.addEventListener("click", collapseAllTopics);

  const notesEditor = document.getElementById("topicNotesInput");

document.querySelectorAll(".notes-toolbar button[data-cmd]")
  .forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault(); // IMPORTANT
      e.stopPropagation();

      const cmd = btn.dataset.cmd;

      notesEditor.focus();

      if (cmd === "clear") {
        document.execCommand("removeFormat");
        document.execCommand("unlink");
        return;
      }

      document.execCommand(cmd, false, null);
    });
  });
  

// Copy notes
document.getElementById("copyNotesBtn").addEventListener("click", () => {
  const selection = window.getSelection();
  const selectedText = selection ? selection.toString().trim() : "";

  const textToCopy = selectedText
    ? selectedText
    : notesEditor.innerText;

  navigator.clipboard.writeText(textToCopy);
});
  const notesHTML =
  notesEditor.innerHTML.trim() || null;

// today page

document.querySelectorAll(".day-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".day-tab").forEach(t =>
      t.classList.remove("active")
    );

    tab.classList.add("active");

    const day = tab.dataset.day;

    document.getElementById("yesterdayList")
      .classList.toggle("hidden", day !== "yesterday");

    document.getElementById("tomorrowList")
      .classList.toggle("hidden", day !== "tomorrow");
  });
});

  