
/*************************************************
 * GLOBAL ERROR TRAP (TEMPORARY DEBUGGING)
 *************************************************/
const DEBUG = false;

if (DEBUG) {
  window.onerror = function (msg, src, line, col, err) {
    console.log("GLOBAL ERROR:", msg, "line:", line);
  };
}
/*************************************************
 * VIEW NAVIGATION
 *************************************************/

function showView(viewName) {
  document.querySelectorAll("section").forEach(sec => {
    sec.style.display = "none";
  });

  const view = document.getElementById(`view-${viewName}`);
  if (!view) {
    console.warn("View not found:", viewName);
    return;
  }

  view.style.display = "block";
}


function setActiveNav(view) {
  document
    .querySelectorAll("#bottomNav button")
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        btn.dataset.view === view
      );
    });
}

showView("home");

/*************************************************
 * APPLICATION BOOTSTRAP
 * Sync persistent state → UI on page load
 *************************************************/

function initApp() {
  loadSettingsUI();

  populateDomainFilter();
  populateDomainSuggestions();

  renderLibrary();
  renderCalendar();
  renderSelectedDate();

  // Default landing screen
  showView("home");
  renderToday();
}

// Run immediately
initApp();


/*************************************************
 * PWA: SERVICE WORKER REGISTRATION
 *************************************************/

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => {
        console.log("[PWA] Service Worker registered");
      })
      .catch(err => {
        console.error("[PWA] Service Worker registration failed", err);
      });
  });
}


/*************************************************
 * PWA: INSTALL EXPERIENCE
 *************************************************/

// Browser-provided install prompt (deferred)
let deferredPrompt = null;

// Capture install prompt and show custom button
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;

  const installBtn = document.getElementById("installBtn");
  if (installBtn) {
    installBtn.style.display = "block";
  }
});

// todays date

(function setTodayNavLabel() {
  const el = document.getElementById("todayLabel");
  if (!el) return;

  const d = new Date();
  const label = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });

  el.textContent = label; // e.g. "13 Jan"
})();

