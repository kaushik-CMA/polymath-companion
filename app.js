/*************************************************
 * VIEW NAVIGATION
 *************************************************/

/**
 * Shows one view and hides all others.
 * Each <section> is treated as a screen.
 */
function showView(viewName) {
  document.querySelectorAll("section").forEach(sec => {
    sec.style.display = "none";
  });

  const activeView = document.getElementById(`view-${viewName}`);
  if (activeView) {
    activeView.style.display = "block";
  }
}


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
  renderDashboard();

  // Default landing screen
  showView("dashboard");
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