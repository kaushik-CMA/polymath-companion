/*************************************************
 * DEMO DATA LOADER — Polymath Companion
 *
 * Purpose:
 * - Demonstrate full app capability
 * - Show formatting, intervals, completion logic
 * - Populate Today / Yesterday / Tomorrow
 *
 * Safe to delete or edit anytime.
 *************************************************/

function loadDemoData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const iso = d => d.toISOString().slice(0, 10);

  const demoTopics = [

    /* ===============================
       TODAY — DEMO #1 (PRIMARY)
    ================================ */
    {
      id: crypto.randomUUID(),
      title: "A place to begin",
      domain: "Learning",
      subDomain: null,
      startDate: iso(new Date(today.getTime() - 3 * 86400000)),
      intervals: [4, 7, 22],
      notes: `
<b>Welcome.</b>

This app is not about memorizing everything.
It is about <i>returning</i> to ideas that matter — over time.

<b>You own your data.</b>
• Everything stays on your device  
• You can export your data anytime  
• You can clear everything and start fresh  

<i>Notes here are optional.</i>
They exist only to remind you what you studied — not to replace your books.
      `.trim(),
      createdAt: iso(today),
      updatedAt: iso(today)
    },

    /* ===============================
       TODAY — DEMO #2 (FEEDBACK)
    ================================ */
    {
      id: crypto.randomUUID(),
      title: "Ask yourself: is this useful?",
      domain: "Reflection",
      subDomain: null,
      startDate: iso(new Date(today.getTime() - 7 * 86400000)),
      intervals: [8, 14],
      notes: `
<i>This app improves only if it earns its place in your routine.</i>

If something feels unclear, heavy, or unnecessary —
that feedback matters.
      `.trim(),
      createdAt: iso(today),
      updatedAt: iso(today)
    },

    /* ===============================
       COMPLETED — MANY INTERVALS
    ================================ */
    {
      id: crypto.randomUUID(),
      title: "Z — What “Completed” means",
      domain: "System",
      subDomain: null,
      startDate: iso(new Date(today.getTime() - 120 * 86400000)),
      intervals: [3, 7, 14, 30, 60, 90],
      notes: `
<b>Completed</b> does not mean “finished forever”.

It simply means:
• No future revisions remain
• The idea has settled (for now)

You can re-activate a topic anytime by
<i>editing its start date or intervals</i>.
      `.trim(),
      createdAt: iso(today),
      updatedAt: iso(today)
    },

    /* ===============================
       COMPLETED — SINGLE INTERVAL
    ================================ */
    {
      id: crypto.randomUUID(),
      title: "Why spaced repetition works",
      domain: "Cognition",
      subDomain: "Memory",
      startDate: iso(new Date(today.getTime() - 30 * 86400000)),
      intervals: [7],
      notes: `Revisiting ideas at increasing intervals forces your brain to reconstruct them,
which leads to longer-lasting understanding than frequent cramming.`.trim(),
      createdAt: iso(today),
      updatedAt: iso(today)
    },

    /* ===============================
       LONG NOTES STRESS TEST
    ================================ */
    {
      id: crypto.randomUUID(),
      title: "Systems thinking overview",
      domain: "Thinking",
      subDomain: "Mental models",
      startDate: iso(new Date(today.getTime() - 5 * 86400000)),
      intervals: [5, 15, 30],
      notes: `
<b>Context summary</b>

Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
ut aliquip ex ea commodo consequat.
      `.trim(),
      createdAt: iso(today),
      updatedAt: iso(today)
    },

    /* ===============================
       REMAINING REALISTIC TOPICS (NO DEMO TEXT)
    ================================ */
    ...generateFillerTopics(today)
  ];

  topics = demoTopics.map(normalizeTopic);
  localStorage.setItem("topics", JSON.stringify(topics));

  // Re-render everything
  renderLibrary();
  renderCalendar();
  renderSelectedDate();
  renderTodayPage();
  populateDomainFilter();
  populateDomainSuggestions();

  alert("Sample data loaded. You can clear it anytime from Settings.");
}


/*************************************************
 * HELPERS
 *************************************************/

function generateFillerTopics(today) {
  const base = [
    ["Linear Algebra", "Math", "Vectors"],
    ["Indian Constitution", "Law", null],
    ["Financial Ratios", "Finance", "Analysis"],
    ["Operating Systems", "CS", "Processes"],
    ["Behavioral Biases", "Psychology", null],
    ["Design Patterns", "CS", "Architecture"],
    ["Supply & Demand", "Economics", null],
    ["Time Value of Money", "Finance", null],
    ["Probability Basics", "Math", null],
    ["Corporate Governance", "Law", null],
    ["Memory Palace", "Learning", "Techniques"],
    ["Decision Trees", "Thinking", null],
    ["Micro vs Macro", "Economics", null]
  ];

  return base.map((item, i) => {
    const offset = (i + 2) * 2;

    return {
      id: crypto.randomUUID(),
      title: item[0],
      domain: item[1],
      subDomain: item[2],
      startDate: iso(new Date(today.getTime() - offset * 86400000)),
      intervals: i % 3 === 0 ? [8, 15, 30, 60] : [3, 10, 30],
      notes: null,
      createdAt: iso(today),
      updatedAt: iso(today)
    };
  });
}

function iso(d) {
  return d.toISOString().slice(0, 10);
}


document
  .getElementById("loadSampleDataBtn")
  .addEventListener("click", () => {
    if (!confirm("This will replace your current data. Continue?")) return;
    loadDemoData();
  });