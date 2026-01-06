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


// V3 TODO
// [ ] Dashboard auto-refresh
// [ ] Navigation tabs
// [ ] Edit topic
// [ ] Delete topic
// [ ] Dark mode
// [ ] Library search

//<a href="https://www.flaticon.com/free-icons/continuous-learning" title="continuous learning icons">Continuous learning icons created by dwicon - Flaticon</a>