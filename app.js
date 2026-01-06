function showView(viewName) {
  document.querySelectorAll("section").forEach(sec => {
    sec.style.display = "none";
  });

  document.getElementById(`view-${viewName}`).style.display = "block";
}



/*************************************************
 * PAGE LOAD – INITIAL UI SYNC
 *************************************************/
loadSettingsUI();
populateDomainFilter();
populateDomainSuggestions();
renderLibrary();
renderCalendar();
renderSelectedDate();
renderDashboard();
showView("dashboard");


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => {
        console.log("Service Worker registered");
      })
      .catch(err => {
        console.error("Service Worker registration failed", err);
      });
  });
}

//<a href="https://www.flaticon.com/free-icons/continuous-learning" title="continuous learning icons">Continuous learning icons created by dwicon - Flaticon</a>