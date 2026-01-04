function showView(viewName) {
  document.querySelectorAll("section").forEach(sec => {
    sec.style.display = "none";
  });

  document.getElementById(`view-${viewName}`).style.display = "block";
}

function applyTheme() {
  document.body.dataset.theme = settings.theme || "light";
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


// V3 TODO
// [ ] Dashboard auto-refresh
// [ ] Navigation tabs
// [ ] Edit topic
// [ ] Delete topic
// [ ] Dark mode
// [ ] Library search
