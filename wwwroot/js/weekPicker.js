// Convert ISO week number (year, weekNum) to start date (Monday)
function getStartOfWeek(year, weekNum) {
  // January 4th is always in week 1 of ISO week calendar
  const jan4 = new Date(year, 0, 4);
  // Get day of week (Monday=1, Sunday=7)
  let jan4Day = jan4.getDay();
  jan4Day = jan4Day === 0 ? 7 : jan4Day;
  // Days to first Monday of the year
  const daysToFirstMonday = jan4Day === 1 ? 0 : 8 - jan4Day;
  const firstMonday = new Date(year, 0, 4 + daysToFirstMonday);
  // Add (weekNum - 1) weeks
  const startDate = new Date(firstMonday);
  startDate.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
  // Return as YYYY-MM-DD
  return startDate.toISOString().split("T")[0];
}

// Get ISO week number for a given date (used to set default picker value)
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  );
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

// Render the weekly grid from backend data
function renderWeeklyGrid(data) {
  const gridContainer = document.getElementById("weeklyGrid");
  if (!gridContainer) return;

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  let html = `<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-top: 15px;">`;

  // Day headers
  daysOfWeek.forEach((day) => {
    html += `<div style="font-weight: bold; text-align: center; padding: 8px; background: #374151; border-radius: 8px;">${day}</div>`;
  });

  // Day cells
  daysOfWeek.forEach((_, index) => {
    const currentDate = new Date(data.weekStart);
    currentDate.setDate(currentDate.getDate() + index);
    const dateStr = currentDate.toISOString().split("T")[0];
    const tasksForDay = data.days[dateStr] || [];
    const isOverloaded = data.overloadedDays.includes(dateStr);

    html += `<div style="background: #1f2937; border-radius: 8px; padding: 8px; min-height: 120px; ${isOverloaded ? "border: 2px solid #f97316;" : ""}">`;
    html += `<div style="font-size: 0.8rem; color: #9ca3af; margin-bottom: 6px;">${dateStr}</div>`;

    if (tasksForDay.length === 0) {
      html += `<div style="color: #6b7280; font-size: 0.8rem;">No tasks</div>`;
    } else {
      tasksForDay.forEach((task) => {
        const priorityColor =
          task.priority === "high"
            ? "#ef4444"
            : task.priority === "medium"
              ? "#f59e0b"
              : "#10b981";
        const statusDecor = task.isCompleted ? "✔️ " : "⏳ ";
        html += `<div style="margin: 4px 0; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                            <span style="display: inline-block; width: 8px; height: 8px; background: ${priorityColor}; border-radius: 50%;"></span>
                            <span style="${task.isCompleted ? "text-decoration: line-through; color: #6b7280;" : ""}">${escapeHtml(task.title)}</span>
                         </div>`;
      });
    }

    if (isOverloaded) {
      html += `<div style="color: #f97316; font-size: 0.7rem; margin-top: 5px;">⚠️ Overloaded</div>`;
    }

    html += `</div>`;
  });

  html += `</div>`;
  gridContainer.innerHTML = html;
}

// Fetch and display weekly tasks when week picker changes
async function onWeekChange() {
  const weekPicker = document.getElementById("weekPicker");
  const weekValue = weekPicker.value;
  if (!weekValue) return;

  const [year, weekNum] = weekValue.split("-W");
  const startDate = getStartOfWeek(parseInt(year), parseInt(weekNum));

  try {
    const response = await fetch(`?handler=GetWeeklyTasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        RequestVerificationToken: getCsrfToken(),
      },
      body: JSON.stringify({ weekStart: startDate }),
    });

    if (response.ok) {
      const data = await response.json();
      renderWeeklyGrid(data);
    } else {
      console.error("Failed to load weekly tasks");
      document.getElementById("weeklyGrid").innerHTML =
        '<div style="color: red;">Error loading weekly tasks</div>';
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("weeklyGrid").innerHTML =
      '<div style="color: red;">Network error</div>';
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const weekPicker = document.getElementById("weekPicker");
  if (!weekPicker) return;

  // Set default to current week
  const today = new Date();
  const year = today.getFullYear();
  const weekNum = getWeekNumber(today);
  weekPicker.value = `${year}-W${weekNum.toString().padStart(2, "0")}`;

  // Attach change listener
  weekPicker.addEventListener("change", onWeekChange);

  // Load initial week
  onWeekChange();
});
