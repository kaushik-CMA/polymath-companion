function navigateToLibraryWithSearch(topic) {
  showView("library");

  const statusValue = isTopicCompleted(topic)
    ? "completed"
    : "active";

  // Set classification
  document.querySelectorAll('input[name="status"]').forEach(r => {
    r.checked = r.value === statusValue;
  });

  // Clear domain filter
  document.getElementById("domainFilter").value = "";

  // Apply search
  const searchInput = document.getElementById("librarySearchInput");
  if (searchInput) {
    searchInput.value = topic.title;
  }

  renderLibrary();
}

/*************************************************
 * LIBRARY VIEW — ENTRY POINT
 *************************************************/

function renderLibrary() {

  applyLibraryOverrides();
  
  const list = document.getElementById("libraryList");
  list.innerHTML = "";

  let filtered = [...topics];

  filtered = applyDomainFilter(filtered);
  filtered = applyStatusFilter(filtered);
  filtered = applySearchFilter(filtered);
  filtered = applySorting(filtered);

  if (filtered.length === 0) {
    renderEmptyLibrary(list);
    return;
  }

  filtered.forEach(topic => {
    const li = renderLibraryItem(topic);
    list.appendChild(li);
  });
}

/*************************************************
 * FILTER OVERRIDES (used by calendar redirects)
 *************************************************/

function applyLibraryOverrides() {
  if (!libraryStatusOverride) return;

  document
    .querySelectorAll('input[name="status"]')
    .forEach(r => {
      r.checked = r.value === libraryStatusOverride;
    });

  libraryStatusOverride = null; // consume once
}

/*************************************************
 * FILTERING LOGIC
 *************************************************/
function getDomainKey(topic) {
  if (!topic.domain) return null;

  return topic.subDomain
    ? `${topic.domain}/ ${topic.subDomain}`
    : topic.domain;
}

function applyDomainFilter(list) {
  const selectedKey = document.getElementById("domainFilter").value;
  if (!selectedKey) return list;

  return list.filter(t => getDomainKey(t) === selectedKey);
}

function applyStatusFilter(list) {
  const status =
    document.querySelector('input[name="status"]:checked')?.value;

  if (status === "active") {
    return list.filter(t => !isTopicCompleted(t));
  }

  if (status === "completed") {
    return list.filter(t => isTopicCompleted(t));
  }

  return list;
}

function applySearchFilter(list) {
  const searchValue =
    document.getElementById("librarySearchInput")
      .value
      .trim()
      .toLowerCase();

  if (!searchValue) return list;

  return list.filter(topic =>
    getSearchText(topic).includes(searchValue)
  );
}

function getSearchText(topic) {
  return [
    topic.title,
    topic.domain,
    topic.subDomain,
    topic.notes
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/*************************************************
 * SORTING
 *************************************************/

function applySorting(list) {
  const sortBy = document.getElementById("sortBy").value;

  const sorted = [...list]; // NEVER mutate input

  switch (sortBy) {
    case "title-asc":
      return sorted.sort((a, b) =>
        a.title.localeCompare(b.title)
      );

    case "title-desc":
      return sorted.sort((a, b) =>
        b.title.localeCompare(a.title)
      );

    case "date-asc":
      return sorted.sort((a, b) =>
        new Date(a.startDate) - new Date(b.startDate)
      );

    case "date-desc":
      return sorted.sort((a, b) =>
        new Date(b.startDate) - new Date(a.startDate)
      );

    case "domain-asc":
      return sorted.sort((a, b) =>
        (a.domain ?? "").localeCompare(b.domain ?? "")
      );

    case "domain-desc":
      return sorted.sort((a, b) =>
        (b.domain ?? "").localeCompare(a.domain ?? "")
      );

    default:
      return sorted;
  }
}
/*************************************************
 * EMPTY STATE
 *************************************************/

function renderEmptyLibrary(list) {
  const li = document.createElement("li");
  li.textContent = "No topics found.";
  li.style.opacity = "0.6";
  list.appendChild(li);
}

/*************************************************
 * ITEM RENDERING
 *************************************************/

function renderLibraryItem(topic) {
  const li = document.createElement("li");

  highlightIfNeeded(li, topic);

  const header = renderLibraryHeader(topic);
  li.appendChild(header);

  if (topic.notes) {
    li.appendChild(renderNotesToggle(topic));
  }

  return li;
}

/*************************************************
 * ITEM HELPERS
 *************************************************/

function highlightIfNeeded(li, topic) {
  if (window.highlightTopicId !== topic.id) return;

  li.style.background = "#eef3ff";
  li.setAttribute("tabindex", "-1");
  li.scrollIntoView({ behavior: "smooth", block: "center" });
  li.focus();

  window.highlightTopicId = null;
}

function renderLibraryHeader(topic) {
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.flexWrap = "wrap";
  header.style.gap = "6px";
  header.style.alignItems = "center";

  const title = document.createElement("strong");
  title.textContent = topic.title;

  const meta = document.createElement("span");
  meta.textContent =
    ` [ ${topic.domain ?? "—"} | ${topic.subDomain ?? "—"}] ${topic.startDate} | [${topic.intervals.join(", ")}]`;
  meta.style.opacity = "0.7";

  header.appendChild(title);
  header.appendChild(meta);
  header.appendChild(renderEditButton(topic));
  header.appendChild(renderDeleteButton(topic));

  return header;
}

function renderEditButton(topic) {
  const btn = document.createElement("button");
  btn.textContent = "Edit";
  btn.className = "secondary";

  btn.addEventListener("click", () => {
    showView("home");
    form.style.display = "block";

    input.value = topic.title;
    intervalValues = [...topic.intervals];
    renderIntervalChips();

    document.getElementById("topicDomainInput").value = topic.domain ?? "";
    document.getElementById("topicSubDomainInput").value = topic.subDomain ?? "";
    document.getElementById("topicStartDateInput").value = topic.startDate;
    document.getElementById("topicNotesInput").value = topic.notes ?? "";

    syncSubDomainAvailability();
    renderLibrary();
    renderCalendar();
    populateDomainFilter();
    populateDomainSuggestions();
    renderToday();

    form.dataset.editingId = topic.id;
  });

  return btn;
}

function renderDeleteButton(topic) {
  const btn = document.createElement("button");
  btn.textContent = "Delete";
  btn.className = "danger";

  btn.addEventListener("click", () => {
    if (!confirm("Delete this topic?")) return;

    topics = topics.filter(t => t.id !== topic.id);
    localStorage.setItem("topics", JSON.stringify(topics));

    renderLibrary();
    renderCalendar();
    populateDomainFilter();
    populateDomainSuggestions();
    populateSubDomainSuggestions()
    renderToday();
  });

  return btn;
}

function renderNotesToggle(topic) {
  const wrapper = document.createElement("div");

  const toggle = document.createElement("button");
  toggle.textContent = "View notes";
  toggle.className = "secondary";
  toggle.style.marginTop = "6px";

  const notesDiv = document.createElement("div");
  notesDiv.textContent = topic.notes;
  notesDiv.style.display = "none";
  notesDiv.style.opacity = "0.8";
  notesDiv.style.marginTop = "4px";

  toggle.addEventListener("click", () => {
    const open = notesDiv.style.display === "none";
    notesDiv.style.display = open ? "block" : "none";
    toggle.textContent = open ? "Hide notes" : "View notes";
  });

  wrapper.appendChild(toggle);
  wrapper.appendChild(notesDiv);

  return wrapper;
}

/*************************************************
 * DOMAIN HELPERS (SHARED)
 *************************************************/

function populateDomainFilter() {
  const select = document.getElementById("domainFilter");

  const keys = Array.from(
    new Set(
      topics
        .map(getDomainKey)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  select.innerHTML = `<option value="">All domains</option>`;

  keys.forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = key;
    select.appendChild(opt);
  });
}

function populateDomainSuggestions() {
  const datalist = document.getElementById("domainSuggestions");

  const domains = [...new Set(
    topics.map(t => t.domain).filter(Boolean)
  )];

  datalist.innerHTML = "";
  domains.sort().forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    datalist.appendChild(opt);
  });
}

function populateSubDomainSuggestions(domain) {
  const datalist = document.getElementById("subDomainSuggestions");
  if (!datalist) return;

  datalist.innerHTML = "";

  if (!domain) return;

  const subDomains = Array.from(
    new Set(
      topics
        .filter(t =>
          t.domain === domain &&
          t.subDomain &&
          typeof t.subDomain === "string"
        )
        .map(t => t.subDomain.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  subDomains.forEach(sd => {
    const opt = document.createElement("option");
    opt.value = sd;
    datalist.appendChild(opt);
  });
}

function getUniqueDomains() {
  return Array.from(
    new Set(topics.map(t => t.domain).filter(Boolean))
  );
}

/*************************************************
 * FILTER COLLAPSE UI
 *************************************************/

function collapseFilters() {
  filtersBody.classList.remove("expanded");
  filtersExpanded = false;
  toggleBtn.textContent = "Show filters";
}