/*************************************************
 * UI EVENTS
 * User intent → orchestration only
 *************************************************/

/*************************************************
 * SUB-DOMAIN AVAILABILITY (SINGLE AUTHORITY)
 *************************************************/
function updateSubDomainUI() {
  const domainInput = document.getElementById("topicDomainInput");
  const subDomainInput = document.getElementById("topicSubDomainInput");

  if (!domainInput || !subDomainInput) return;

  const domain = domainInput.value.trim();

  if (!domain) {
    subDomainInput.value = "";
    subDomainInput.disabled = true;
    subDomainInput.classList.add("disabled-input");

    const datalist = document.getElementById("subDomainSuggestions");
    if (datalist) datalist.innerHTML = "";
    return;
  }

  subDomainInput.disabled = false;
  subDomainInput.classList.remove("disabled-input");

  populateSubDomainSuggestions(domain);
}

domainInput?.addEventListener("input", updateSubDomainUI);
domainInput?.addEventListener("change", updateSubDomainUI);

/*************************************************
 * ADD TOPIC
 *************************************************/
addBtn.addEventListener("click", () => {
  form.style.display = "block";
  delete form.dataset.editingId;

  input.value = "";
  intervalNumberInput.value = "";
  document.getElementById("topicNotesInput").innerHTML = "";

  intervalValues = [...settings.defaultIntervals];
  renderIntervalChips();
  renderIntervalHistory();

  domainInput.value = "";

  if (SubDomainInput) {
  SubDomainInput.value = "";
  SubDomainInput.disabled = true;
  SubDomainInput.classList.add("disabled-input");
}
  updateSubDomainUI();

  document.getElementById("topicStartDateInput").value =
    new Date().toISOString().slice(0, 10);
});

/*************************************************
 * CANCEL ADD / EDIT
 *************************************************/
cancelBtn.addEventListener("click", () => {
  form.style.display = "none";
  intervalValues = [];
  renderIntervalChips();

  input.value = "";
  intervalNumberInput.value = "";
  document.getElementById("topicDomainInput").value = "";
  document.getElementById("topicNotesInput").innerHTML = "";
});

/*************************************************
 * SAVE TOPIC (ADD / EDIT)
 *************************************************/
saveBtn.addEventListener("click", e => {
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
    document.getElementById("topicNotesInput").innerHTML.trim() || null;

  const today = new Date().toISOString().slice(0, 10);
  const editingId = form.dataset.editingId;
  const intervalsSnapshot = [...intervalValues];

  if (editingId) {
    const index = topics.findIndex(t => t.id === editingId);
    topics[index] = {
      ...topics[index],
      title,
      domain: domain || null,
      subDomain,
      notes,
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
      notes,
      startDate: startDate || today,
      intervals: intervalsSnapshot,
      createdAt: today,
      updatedAt: today
    });
  }

  updateIntervalHistory(intervalsSnapshot);
  localStorage.setItem("topics", JSON.stringify(topics));

  intervalValues = [];
  renderIntervalChips();
  form.style.display = "none";

  renderLibrary();
  renderCalendar();
  renderSelectedDate();
  renderTodayPage();
  populateDomainFilter();
  populateDomainSuggestions();
});

/*************************************************
 * EDIT TOPIC (FROM LIBRARY)
 *************************************************/
function openEditTopic(topic) {
  showView("home");
  form.style.display = "block";

  input.value = topic.title;
  intervalValues = [...topic.intervals];
  renderIntervalChips();

  document.getElementById("topicDomainInput").value = topic.domain ?? "";
  document.getElementById("topicSubDomainInput").value = topic.subDomain ?? "";
  document.getElementById("topicStartDateInput").value = topic.startDate;
  document.getElementById("topicNotesInput").innerHTML = topic.notes ?? "";

  form.dataset.editingId = topic.id;
  updateSubDomainUI();
}

/*************************************************
 * DELETE TOPIC
 *************************************************/
function deleteTopic(id) {
  if (!confirm("Delete this topic?")) return;

  topics = topics.filter(t => t.id !== id);
  localStorage.setItem("topics", JSON.stringify(topics));

  renderLibrary();
  renderCalendar();
  renderSelectedDate();
  renderTodayPage();
}

/*************************************************
 * CALENDAR NAVIGATION
 *************************************************/
document.getElementById("prevMonthBtn")
  ?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

document.getElementById("nextMonthBtn")
  ?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

todayBtn?.addEventListener("click", () => {
  const today = new Date();
  currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedDate = today;
  renderCalendar();
  renderSelectedDate();
});

/*************************************************
 * LIBRARY FILTERS
 *************************************************/
document.getElementById("domainFilter")
  ?.addEventListener("change", renderLibrary);

document.getElementById("sortBy")
  ?.addEventListener("change", renderLibrary);

document.getElementById("librarySearchInput")
  ?.addEventListener("input", renderLibrary);

document
  .querySelectorAll('input[name="status"]')
  .forEach(r => r.addEventListener("change", renderLibrary));

document.getElementById("clearLibraryFilters")
  ?.addEventListener("click", () => {
    document.querySelectorAll('input[name="status"]').forEach(r => {
      r.checked = r.value === "active";
    });

    document.getElementById("domainFilter").value = "";
    document.getElementById("librarySearchInput").value = "";
    document.getElementById("sortBy").value = "title-asc";
    renderLibrary();
  });

/*************************************************
 * FILTER TOGGLE (LIBRARY)
 *************************************************/

let filtersExpanded = false;

const toggleBtn = document.getElementById("toggleFiltersBtn");
const filtersBody = document.querySelector(".filters-body");

if (toggleBtn && filtersBody) {
  toggleBtn.addEventListener("click", () => {
    filtersExpanded = !filtersExpanded;

    filtersBody.classList.toggle("expanded", filtersExpanded);
    toggleBtn.textContent =
      filtersExpanded ? "Hide filters" : "Show filters";
  });
}
/*************************************************
 * MAIN NAVIGATION
 *************************************************/
document.getElementById("bottomNav")
  ?.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    showView(btn.dataset.view);
  });

/*************************************************
 * IMPORT / EXPORT
 *************************************************/
exportBtn?.addEventListener("click", () => {
  const blob = new Blob(
    [JSON.stringify(topics, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "polymath-companion-data.json";
  a.click();
  URL.revokeObjectURL(url);
});

importInput?.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid data format");
      }

      topics = parsed.map(normalizeTopic);
      localStorage.setItem("topics", JSON.stringify(topics));

      renderLibrary();
      renderCalendar();
      renderSelectedDate();
      renderTodayPage();
      populateDomainFilter();
      populateDomainSuggestions();

      alert("Import successful.");
    } catch {
      alert("Invalid or incompatible file.");
    }
  };
  reader.readAsText(file);
});
/*************************************************
 * SETTINGS
 *************************************************/
saveSettingsBtn?.addEventListener("click", () => {
  const raw = defaultIntervalsInput.value;
  const parsed = raw
    .split(",")
    .map(v => parseInt(v.trim()))
    .filter(v => !isNaN(v) && v > 0);

  settings.defaultIntervals =
    parsed.length ? parsed : defaultSettings.defaultIntervals;

  localStorage.setItem("settings", JSON.stringify(settings));
  alert("Defaults saved.");
});

/*************************************************
 * NOTES FORMATTING
 *************************************************/
document.querySelectorAll(".notes-toolbar button[data-cmd]")
  .forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
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

copyNotesBtn?.addEventListener("click", () => {
  const sel = window.getSelection();
  const text =
    sel && sel.toString().trim()
      ? sel.toString()
      : notesEditor.innerText;

  navigator.clipboard.writeText(text);
});
-
document.getElementById("expandAllBtn")
  ?.addEventListener("click", expandAllTopics);

document.getElementById("collapseAllBtn")
  ?.addEventListener("click", collapseAllTopics);

  //clear all data handler

  (function wireClearData() {
  const clearBtn = document.getElementById("clearDataBtn");
  if (!clearBtn) return;

  clearBtn.addEventListener("click", () => {
    const confirmed = confirm(
      "This will permanently delete ALL topics and settings from this device.\n\nThis action cannot be undone.\n\nContinue?"
    );

    if (!confirmed) return;

    // Clear storage
    localStorage.removeItem("topics");
    localStorage.removeItem("settings");
    localStorage.removeItem("intervalHistory");

    // Reset in-memory state
    topics = [];
    intervalValues = [];

    // Re-render all dependent views
    renderLibrary();
    renderCalendar();
    renderSelectedDate();
    renderTodayPage();
    populateDomainFilter();
    populateDomainSuggestions();

    alert("All data has been cleared.");
  });
})();

//rate app
(function wireRateApp() {
  const rateBtn = document.getElementById("rateApp");
  if (!rateBtn) return;

  rateBtn.addEventListener("click", () => {
    // TEMP behavior (pre-Play Store)
    alert("If Polymath Companion helps you think better, a rating really helps 🙂");

    // 👉 AFTER PLAY STORE RELEASE
    // Replace PACKAGE_NAME with actual id
    /*
    const packageName = "com.yourname.polymathcompanion";
    window.open(
      `https://play.google.com/store/apps/details?id=${packageName}`,
      "_blank"
    );
    */
  });
})();

//feedback

(function wireFeedback() {
  const feedbackBtn = document.getElementById("feedbackBtn");
  if (!feedbackBtn) return;

  feedbackBtn.addEventListener("click", () => {
    const subject = encodeURIComponent(
      "Polymath Companion — Feedback"
    );

    const body = encodeURIComponent(
`Hi Kaushik,

I’d like to share the following feedback:

(What worked well?)
(What felt confusing?)
(What would make this better?)

Thanks for building this.
`
    );

    window.location.href =
      `mailto:kaushikgauns@gmail.com?subject=${subject}&body=${body}`;
  });
})();