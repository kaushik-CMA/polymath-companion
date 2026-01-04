/*************************************************
 * INTERVAL CHIP RENDERING
 *************************************************/
function renderIntervalChips() {
  intervalChipsDiv.innerHTML = "";

  intervalValues.forEach((val, index) => {
    const chip = document.createElement("div");
    chip.className = "interval-chip";
    chip.innerHTML = `${val} <span data-index="${index}">×</span>`;
    intervalChipsDiv.appendChild(chip);
  });
}

// Remove interval chip (event delegation)
intervalChipsDiv.addEventListener("click", (e) => {
  if (e.target.tagName === "SPAN") {
    const index = Number(e.target.dataset.index);
    intervalValues.splice(index, 1);
    renderIntervalChips();
  }
});

// Add interval via Enter key
intervalNumberInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addInterval();
  }
});

// Add interval via button
addIntervalBtn.addEventListener("click", addInterval);

function addInterval() {
  const val = parseInt(intervalNumberInput.value);

  if (!isNaN(val) && val > 0 && !intervalValues.includes(val)) {
    intervalValues.push(val);
    intervalValues.sort((a, b) => a - b);
    renderIntervalChips();
  }

  intervalNumberInput.value = "";
}
