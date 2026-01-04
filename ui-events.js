
/*************************************************
 * EVENT LISTENERS (USER ACTIONS)
 *************************************************/

// Open Add Topic form
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

// Cancel Add Topic
cancelBtn.addEventListener("click", () => {
  form.style.display = "none";
  intervalValues = [];
  renderIntervalChips();

  input.value = "";
  intervalNumberInput.value = "";
  document.getElementById("topicDomainInput").value = "";
  document.getElementById("topicNotesInput").value = "";
});

// Save Topic
saveBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const title = input.value.trim();
  if (!title || intervalValues.length === 0) return;

  const domainInput =
    document.getElementById("topicDomainInput").value.trim();

  const startDateInput =
    document.getElementById("topicStartDateInput").value;

  const notesInput =
    document.getElementById("topicNotesInput").value.trim();

  const today = new Date().toISOString().slice(0, 10);
  const editingId = form.dataset.editingId;

  if (editingId) {
    // ===== EDIT EXISTING TOPIC =====
    const index = topics.findIndex(t => t.id === editingId);

    topics[index] = {
      ...topics[index],
      title,
      domain: domainInput || null,
      notes: notesInput || null,
      startDate: startDateInput || today,
      intervals: [...intervalValues],
      updatedAt: today
    };

    delete form.dataset.editingId;

  } else {
    // ===== ADD NEW TOPIC =====
    topics.push({
      id: crypto.randomUUID(),
      title,
      domain: domainInput || null,
      notes: notesInput || null,
      startDate: startDateInput || today,
      intervals: [...intervalValues],
      createdAt: today,
      updatedAt: today
    });
  }

  // ===== COMMON CLEANUP & RENDER =====
  localStorage.setItem("topics", JSON.stringify(topics));

  intervalValues = [];
  renderIntervalChips();
  form.style.display = "none";

  renderLibrary();
  renderCalendar();
  renderSelectedDate();
  renderDashboard();
});

// Calendar navigation
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

// Library filters
document.getElementById("domainFilter")
  .addEventListener("change", renderLibrary);

document.getElementById("sortBy")
  .addEventListener("change", renderLibrary);

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

// Save settings
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

    settings.defaultDomain =
      document.getElementById("defaultDomainInput").value.trim();

    localStorage.setItem("settings", JSON.stringify(settings));
    alert("Settings saved.");
  });

  //navigation bar
  document.getElementById("mainNav").addEventListener("click", e => {
  if (e.target.tagName !== "BUTTON") return;
  showView(e.target.dataset.view);
});

//

    document.getElementById("librarySearchInput").addEventListener("input", renderLibrary);

    document
  .querySelectorAll('input[name="status"]')
  .forEach(radio => {
    radio.addEventListener("change", renderLibrary);
  });
