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
  const domainFilter=document.getElementById("domainFilter");
  if(domainFilter) domainFilter.value = "";
  renderLibrary();

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
 * FITERING LOGIC
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
        (getDomainKey(a) ?? "").localeCompare(getDomainKey(b) ?? "")
      );

    case "domain-desc":
      return sorted.sort((a, b) =>
        (getDomainKey(b) ?? "").localeCompare(getDomainKey(a) ?? "")
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

//icon button helper

function createIconButton(label, type) {
  const btn = document.createElement("button");
  btn.className = `icon-btn ${type}`;
  btn.textContent = label;
  return btn;
}
function openEditTopic(topic) {
  showView("home");
  form.style.display = "block";

  input.value = topic.title;
  intervalValues = [...topic.intervals];
  renderIntervalChips();

  document.getElementById("topicDomainInput").value = topic.domain ?? "";
  document.getElementById("topicSubDomainInput").value = topic.subDomain ?? "";
  document.getElementById("topicStartDateInput").value = topic.startDate;
  document.getElementById("topicNotesInput").value = topic.notes ?? "";

  form.dataset.editingId = topic.id;
}

function deleteTopic(id) {
  if (!confirm("Delete this topic?")) return;

  topics = topics.filter(t => t.id !== id);
  localStorage.setItem("topics", JSON.stringify(topics));

  renderLibrary();
  renderCalendar();
}

function renderLibraryItem(topic) {
  const li = document.createElement("li");
  li.className = "library-item";
  li.dataset.id = topic.id;

  /* ===============================
     HEADER
  ================================ */
  const header = document.createElement("div");
  header.className = "topic-header";

  const title = document.createElement("div");
  title.className = "topic-title";
  title.textContent = topic.title;

  const actions = document.createElement("div");
  actions.className = "topic-actions";

  // 👁 Notes toggle (always visible if notes exist)
  let notesDiv = null;
  let notesBtn = null;

  if (topic.notes && topic.notes.trim()) {
    notesBtn = document.createElement("button");
    notesBtn.className = "icon-btn notes-toggle";
    notesBtn.setAttribute("aria-label", "Toggle notes");
    notesBtn.textContent = "👁";
    actions.appendChild(notesBtn);
  }

  // ✏️ Edit (ALWAYS visible)
const editBtn = document.createElement("button");
editBtn.className = "icon-btn edit-topic";
editBtn.setAttribute("aria-label", "Edit topic");
editBtn.textContent = "✏️";

editBtn.addEventListener("click", e => {
  e.stopPropagation();
  openEditTopic(topic);
});

actions.appendChild(editBtn);

  // ❌ Delete (always visible)
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-btn delete-topic";
  deleteBtn.setAttribute("aria-label", "Delete topic");
  deleteBtn.textContent = "❌";

  deleteBtn.addEventListener("click", e => {
    e.stopPropagation();
    deleteTopic(topic.id);
  });

  actions.appendChild(deleteBtn);

  header.append(title, actions);
  li.appendChild(header);

  /* ===============================
     DETAILS (collapsed by default)
  ================================ */
  const details = document.createElement("div");
  details.className = "topic-details collapsed";

  details.append(
    createDetailRow("Category", topic.domain ?? "—"),
    createDetailRow("Sub-category", topic.subDomain ?? "—"),
    createDetailRow("Start date", topic.startDate),
    createDetailRow("Intervals", topic.intervals.join(", "))
  );

  li.appendChild(details);

  /* ===============================
     NOTES (hidden by default)
  ================================ */
  if (topic.notes && topic.notes.trim()) {
    notesDiv = document.createElement("div");
    notesDiv.className = "topic-notes hidden";
    notesDiv.textContent = topic.notes;
    li.appendChild(notesDiv);

    notesBtn.addEventListener("click", e => {
      e.stopPropagation();
      const isHidden = notesDiv.classList.toggle("hidden");
      notesBtn.textContent = isHidden ? "👁" : "🙈";
    });
  }

  /* ===============================
     HEADER CLICK → TOGGLE DETAILS
  ================================ */
  header.addEventListener("click", e => {
    if (e.target.closest(".icon-btn")) return;
    details.classList.toggle("collapsed");
  });

  return li;
}

function createDetailRow(label, value) {
  const row = document.createElement("div");
  row.className = "detail-row";

  const l = document.createElement("span");
  l.className = "label";
  l.textContent = label;

  const v = document.createElement("span");
  v.className = "value";
  v.textContent = value;

  row.append(l, v);
  return row;
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

/*************************************************
 * FILTER COLLAPSE UI
 *************************************************/

function collapseFilters() {
  filtersBody.classList.remove("expanded");
  filtersExpanded = false;
  toggleBtn.textContent = "Show filters";
}