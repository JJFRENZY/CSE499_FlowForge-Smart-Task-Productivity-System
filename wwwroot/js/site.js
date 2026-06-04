const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const categorySelect = document.getElementById("categorySelect");
const dueDateInput = document.getElementById("dueDateInput");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const overdueTasks = document.getElementById("overdueTasks");
const createdThisWeek = document.getElementById("createdThisWeek");
const completedThisWeek = document.getElementById("completedThisWeek");

const editModal = document.getElementById("editModal");
const editTaskInput = document.getElementById("editTaskInput");
const editPrioritySelect = document.getElementById("editPrioritySelect");
const editCategorySelect = document.getElementById("editCategorySelect");
const editDueDateInput = document.getElementById("editDueDateInput");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let taskBeingEdited = null;
let taskStatusChart = null;

loadTasks();
updateDashboardStats();

addTaskBtn.addEventListener("click", function () {
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;
    const category = categorySelect.value;
    const dueDate = dueDateInput.value;

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    createTask(
        taskText,
        false,
        priority,
        category,
        dueDate,
        getTodayString(),
        ""
    );

    saveTasks();
    updateDashboardStats();

    taskInput.value = "";
    dueDateInput.value = "";
    prioritySelect.value = "low";
    categorySelect.value = "school";
});

function getTodayString() {
    const today = new Date();
    return today.toISOString().split("T")[0];
}

function isOverdue(dueDate) {
    if (!dueDate) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate + "T00:00:00");
    due.setHours(0, 0, 0, 0);

    return due < today;
}

function isThisWeek(dateString) {
    if (!dateString) {
        return false;
    }

    const date = new Date(dateString + "T00:00:00");
    const today = new Date();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return date >= startOfWeek && date <= endOfWeek;
}

function getPriorityText(priority) {
    if (priority === "high") {
        return "HIGH";
    }

    if (priority === "medium") {
        return "MED";
    }

    return "LOW";
}

function getCategoryText(category) {
    if (category === "school") {
        return "SCHOOL";
    }

    if (category === "work") {
        return "WORK";
    }

    if (category === "personal") {
        return "PERSONAL";
    }

    return "OTHER";
}

function createTask(taskText, completedStatus, priority, category, dueDate, createdDate, completedDate) {
    const li = document.createElement("li");
    li.classList.add("task-item");

    li.dataset.createdDate = createdDate || getTodayString();
    li.dataset.completedDate = completedDate || "";

    if (completedStatus) {
        li.classList.add("completed");

        if (!li.dataset.completedDate) {
            li.dataset.completedDate = getTodayString();
        }
    }

    const leftContainer = document.createElement("div");
    leftContainer.classList.add("task-left");

    const taskInfo = document.createElement("div");
    taskInfo.classList.add("task-info");

    const taskTextElement = document.createElement("span");
    taskTextElement.classList.add("task-text");
    taskTextElement.textContent = taskText;

    const metaContainer = document.createElement("div");
    metaContainer.classList.add("meta-container");

    const priorityLabel = document.createElement("span");
    priorityLabel.classList.add("priority-label", priority);
    priorityLabel.textContent = getPriorityText(priority);

    const categoryLabel = document.createElement("span");
    categoryLabel.classList.add("category-label", category);
    categoryLabel.textContent = getCategoryText(category);

    metaContainer.appendChild(priorityLabel);
    metaContainer.appendChild(categoryLabel);

    if (dueDate !== "") {
        const dueDateLabel = document.createElement("span");
        dueDateLabel.classList.add("due-date");
        dueDateLabel.textContent = `Due: ${dueDate}`;

        if (isOverdue(dueDate) && !completedStatus) {
            dueDateLabel.classList.add("overdue");
        }

        metaContainer.appendChild(dueDateLabel);
    }

    taskInfo.appendChild(taskTextElement);
    taskInfo.appendChild(metaContainer);
    leftContainer.appendChild(taskInfo);

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Complete";
    completeBtn.classList.add("complete-btn");

    completeBtn.addEventListener("click", function () {
        li.classList.toggle("completed");

        if (li.classList.contains("completed")) {
            li.dataset.completedDate = getTodayString();
        } else {
            li.dataset.completedDate = "";
        }

        const dueDateLabel = li.querySelector(".due-date");
        const currentDueDate = getTaskDueDate(li);

        if (dueDateLabel) {
            if (li.classList.contains("completed")) {
                dueDateLabel.classList.remove("overdue");
            } else if (isOverdue(currentDueDate)) {
                dueDateLabel.classList.add("overdue");
            }
        }

        saveTasks();
        updateDashboardStats();
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-btn");

    editBtn.addEventListener("click", function () {
        openEditModal(li);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", function () {
        li.remove();
        saveTasks();
        updateDashboardStats();
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    buttonContainer.appendChild(completeBtn);
    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(deleteBtn);

    li.appendChild(leftContainer);
    li.appendChild(buttonContainer);

    taskList.appendChild(li);
}

function openEditModal(taskItem) {
    taskBeingEdited = taskItem;

    editTaskInput.value = taskItem.querySelector(".task-text").textContent;
    editPrioritySelect.value = getTaskPriority(taskItem);
    editCategorySelect.value = getTaskCategory(taskItem);
    editDueDateInput.value = getTaskDueDate(taskItem);

    editModal.classList.remove("hidden");
}

function closeEditModal() {
    editModal.classList.add("hidden");
    taskBeingEdited = null;
}

saveEditBtn.addEventListener("click", function () {
    if (!taskBeingEdited) {
        return;
    }

    const newText = editTaskInput.value.trim();
    const newPriority = editPrioritySelect.value;
    const newCategory = editCategorySelect.value;
    const newDueDate = editDueDateInput.value;

    if (newText === "") {
        alert("Task name cannot be empty.");
        return;
    }

    const isCompleted = taskBeingEdited.classList.contains("completed");

    taskBeingEdited.querySelector(".task-text").textContent = newText;

    const priorityLabel = taskBeingEdited.querySelector(".priority-label");
    priorityLabel.className = "priority-label";
    priorityLabel.classList.add(newPriority);
    priorityLabel.textContent = getPriorityText(newPriority);

    const categoryLabel = taskBeingEdited.querySelector(".category-label");
    categoryLabel.className = "category-label";
    categoryLabel.classList.add(newCategory);
    categoryLabel.textContent = getCategoryText(newCategory);

    const metaContainer = taskBeingEdited.querySelector(".meta-container");
    const oldDueDateLabel = taskBeingEdited.querySelector(".due-date");

    if (oldDueDateLabel) {
        oldDueDateLabel.remove();
    }

    if (newDueDate !== "") {
        const newDueDateLabel = document.createElement("span");
        newDueDateLabel.classList.add("due-date");
        newDueDateLabel.textContent = `Due: ${newDueDate}`;

        if (isOverdue(newDueDate) && !isCompleted) {
            newDueDateLabel.classList.add("overdue");
        }

        metaContainer.appendChild(newDueDateLabel);
    }

    saveTasks();
    updateDashboardStats();
    closeEditModal();
});

cancelEditBtn.addEventListener("click", function () {
    closeEditModal();
});

editModal.addEventListener("click", function (event) {
    if (event.target === editModal) {
        closeEditModal();
    }
});

function getTaskPriority(taskItem) {
    const priorityLabel = taskItem.querySelector(".priority-label");

    if (priorityLabel.classList.contains("high")) {
        return "high";
    }

    if (priorityLabel.classList.contains("medium")) {
        return "medium";
    }

    return "low";
}

function getTaskCategory(taskItem) {
    const categoryLabel = taskItem.querySelector(".category-label");

    if (!categoryLabel) {
        return "school";
    }

    if (categoryLabel.classList.contains("work")) {
        return "work";
    }

    if (categoryLabel.classList.contains("personal")) {
        return "personal";
    }

    if (categoryLabel.classList.contains("other")) {
        return "other";
    }

    return "school";
}

function getTaskDueDate(taskItem) {
    const dueDateElement = taskItem.querySelector(".due-date");

    if (!dueDateElement) {
        return "";
    }

    return dueDateElement.textContent.replace("Due: ", "");
}

function updateDashboardStats() {
    const allTasks = document.querySelectorAll(".task-item");

    let completedCount = 0;
    let overdueCount = 0;
    let createdThisWeekCount = 0;
    let completedThisWeekCount = 0;

    allTasks.forEach(function (task) {
        const isCompleted = task.classList.contains("completed");
        const dueDate = getTaskDueDate(task);
        const createdDate = task.dataset.createdDate;
        const completedDate = task.dataset.completedDate;

        if (isCompleted) {
            completedCount++;
        }

        if (!isCompleted && isOverdue(dueDate)) {
            overdueCount++;
        }

        if (isThisWeek(createdDate)) {
            createdThisWeekCount++;
        }

        if (isThisWeek(completedDate)) {
            completedThisWeekCount++;
        }
    });

    const totalCount = allTasks.length;
    const pendingCount = totalCount - completedCount;

    totalTasks.textContent = totalCount;
    completedTasks.textContent = completedCount;
    pendingTasks.textContent = pendingCount;
    overdueTasks.textContent = overdueCount;
    createdThisWeek.textContent = createdThisWeekCount;
    completedThisWeek.textContent = completedThisWeekCount;

    updateTaskStatusChart(completedCount, pendingCount);
}

function updateTaskStatusChart(completedCount, pendingCount) {
    const chartCanvas = document.getElementById("taskStatusChart");

    if (!chartCanvas || typeof Chart === "undefined") {
        return;
    }

    if (taskStatusChart) {
        taskStatusChart.destroy();
    }

    taskStatusChart = new Chart(chartCanvas, {
        type: "pie",
        data: {
            labels: ["Completed", "Pending"],
            datasets: [
                {
                    data: [completedCount, pendingCount],
                    backgroundColor: ["#50c878", "#ef4444"],
                    borderColor: "#1e1e2f",
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#ffffff"
                    }
                }
            }
        }
    });
}

function saveTasks() {
    const tasks = [];
    const allTasks = document.querySelectorAll(".task-item");

    allTasks.forEach(function (task) {
        tasks.push({
            text: task.querySelector(".task-text").textContent,
            completed: task.classList.contains("completed"),
            priority: getTaskPriority(task),
            category: getTaskCategory(task),
            dueDate: getTaskDueDate(task),
            createdDate: task.dataset.createdDate || getTodayString(),
            completedDate: task.dataset.completedDate || ""
        });
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const storedTasks = localStorage.getItem("tasks");

    if (storedTasks === null) {
        return;
    }

    const tasks = JSON.parse(storedTasks);

    tasks.forEach(function (task) {
        createTask(
            task.text,
            task.completed,
            task.priority || "low",
            task.category || "school",
            task.dueDate || "",
            task.createdDate || getTodayString(),
            task.completedDate || ""
        );
    });
}