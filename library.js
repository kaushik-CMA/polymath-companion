/*************************************************
 * LIBRARY VIEW + FILTERING
 *************************************************/
function populateDomainFilter() {
  const select = document.getElementById("domainFilter");

  const domains = Array.from(
    new Set(topics.map(t => t.domain).filter(Boolean))
  );

  select.innerHTML = `<option value="">All domains</option>`;

  domains.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });
}

function populateDomainSuggestions() {
  const datalist = document.getElementById("domainSuggestions");

  const domains = Array.from(
    new Set(topics.map(t => t.domain).filter(Boolean))
  );

  datalist.innerHTML = "";

  domains.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    datalist.appendChild(opt);
  });
}

function renderLibrary() {
  const list = document.getElementById("libraryList");
  const domainFilter = document.getElementById("domainFilter").value;
  const sortBy = document.getElementById("sortBy").value;

  list.innerHTML = "";

  let filtered = [...topics];

  // ---------- FILTER ----------
  if (domainFilter) {
    filtered = filtered.filter(t => t.domain === domainFilter);
  }

  function getSearchText(topic) {
  return [
    topic.title,
    topic.domain,
    topic.notes
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

const status =
  document.querySelector('input[name="status"]:checked')?.value??"active";

  if (status === "active") {
  filtered = filtered.filter(t => !isTopicCompleted(t));
}

if (status === "completed") {
  filtered = filtered.filter(t => isTopicCompleted(t));
}


const searchValue = document.getElementById("librarySearchInput").value.trim().toLowerCase();

    if (searchValue) {
  filtered = filtered.filter(topic =>
    getSearchText(topic).includes(searchValue)
  );
}
if (filtered.length === 0) {
  list.innerHTML = "<li>No matching topics</li>";
  return;
}




  // ---------- SORT ----------
  if (sortBy === "title") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortBy === "startDate") {
    filtered.sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
  }

  // ---------- EMPTY STATE ----------
  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No topics found.";
    li.style.opacity = "0.6";
    list.appendChild(li);
    return;
  }

  // ---------- RENDER ITEMS ----------
  filtered.forEach(t => {
    const li = document.createElement("li");

    // ---- HEADER ----
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.flexWrap = "wrap";
    header.style.gap = "6px";
    header.style.alignItems = "center";

    const title = document.createElement("strong");
    title.textContent = t.title;

    const meta = document.createElement("span");
    meta.textContent = ` | ${t.domain ?? "—"} | ${t.startDate} | [${t.intervals.join(", ")}]`;
    meta.style.opacity = "0.7";

    header.appendChild(title);
    header.appendChild(meta);

    // ---- EDIT BUTTON ----
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "secondary";

    editBtn.addEventListener("click", () => {
      showView("dashboard"); // ensure form is visible
      form.style.display = "block";

      input.value = t.title;
      intervalValues = [...t.intervals];
      renderIntervalChips();

      document.getElementById("topicDomainInput").value = t.domain ?? "";
      document.getElementById("topicStartDateInput").value = t.startDate;
      document.getElementById("topicNotesInput").value = t.notes ?? "";

      form.dataset.editingId = t.id;
    });

    // ---- DELETE BUTTON ----
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "danger";

    delBtn.addEventListener("click", () => {
      if (!confirm("Delete this topic?")) return;

      topics = topics.filter(x => x.id !== t.id);
      localStorage.setItem("topics", JSON.stringify(topics));

      renderLibrary();
      renderCalendar();
      renderDashboard();
    });

    header.appendChild(editBtn);
    header.appendChild(delBtn);
    li.appendChild(header);

    // ---- NOTES TOGGLE ----
    if (t.notes) {
      const toggle = document.createElement("button");
      toggle.textContent = "View notes";
      toggle.className = "secondary";
      toggle.style.marginTop = "6px";

      const notesDiv = document.createElement("div");
      notesDiv.textContent = t.notes;
      notesDiv.style.display = "none";
      notesDiv.style.opacity = "0.8";
      notesDiv.style.marginTop = "4px";

      toggle.addEventListener("click", () => {
        const open = notesDiv.style.display === "none";
        notesDiv.style.display = open ? "block" : "none";
        toggle.textContent = open ? "Hide notes" : "View notes";
      });

      li.appendChild(toggle);
      li.appendChild(notesDiv);
    }

    list.appendChild(li);
  });
}
  