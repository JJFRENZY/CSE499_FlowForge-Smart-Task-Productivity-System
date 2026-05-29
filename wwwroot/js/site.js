const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDateInput");
const taskList = document.getElementById("taskList");

const editModal = document.getElementById("editModal");
const editTaskInput = document.getElementById("editTaskInput");
const editPrioritySelect = document.getElementById("editPrioritySelect");
const editDueDateInput = document.getElementById("editDueDateInput");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let taskBeingEdited = null;

loadTasks();

addTaskBtn.addEventListener("click", function () {
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    createTask(taskText, false, priority, dueDate);
    saveTasks();

    taskInput.value = "";
    dueDateInput.value = "";
    prioritySelect.value = "low";
});

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

function getPriorityText(priority) {
    if (priority === "high") {
        return "HIGH";
    }

    if (priority === "medium") {
        return "MED";
    }

    return "LOW";
}

function createTask(taskText, completedStatus, priority, dueDate) {
    const li = document.createElement("li");
    li.classList.add("task-item");

    if (completedStatus) {
        li.classList.add("completed");
    }

    const leftContainer = document.createElement("div");
    leftContainer.classList.add("task-left");

    const taskInfo = document.createElement("div");
    taskInfo.classList.add("task-info");

    const span = document.createElement("span");
    span.classList.add("task-text");
    span.textContent = taskText;

    const metaContainer = document.createElement("div");
    metaContainer.classList.add("meta-container");

    const priorityLabel = document.createElement("span");
    priorityLabel.classList.add("priority-label");
    priorityLabel.classList.add(priority);
    priorityLabel.textContent = getPriorityText(priority);

    metaContainer.appendChild(priorityLabel);

    if (dueDate !== "") {
        const dueDateLabel = document.createElement("span");
        dueDateLabel.classList.add("due-date");

        if (isOverdue(dueDate) && !completedStatus) {
            dueDateLabel.classList.add("overdue");
        }

        dueDateLabel.textContent = `Due: ${dueDate}`;
        metaContainer.appendChild(dueDateLabel);
    }

    taskInfo.appendChild(span);
    taskInfo.appendChild(metaContainer);
    leftContainer.appendChild(taskInfo);

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Complete";
    completeBtn.classList.add("complete-btn");

    completeBtn.addEventListener("click", function () {
        li.classList.toggle("completed");

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
    const newDueDate = editDueDateInput.value;

    if (newText === "") {
        alert("Task name cannot be empty.");
        return;
    }

    const wasCompleted = taskBeingEdited.classList.contains("completed");

    taskBeingEdited.querySelector(".task-text").textContent = newText;

    const priorityLabel = taskBeingEdited.querySelector(".priority-label");
    priorityLabel.className = "priority-label";
    priorityLabel.classList.add(newPriority);
    priorityLabel.textContent = getPriorityText(newPriority);

    const metaContainer = taskBeingEdited.querySelector(".meta-container");
    const oldDueDateLabel = taskBeingEdited.querySelector(".due-date");

    if (oldDueDateLabel) {
        oldDueDateLabel.remove();
    }

    if (newDueDate !== "") {
        const newDueDateLabel = document.createElement("span");
        newDueDateLabel.classList.add("due-date");
        newDueDateLabel.textContent = `Due: ${newDueDate}`;

        if (isOverdue(newDueDate) && !wasCompleted) {
            newDueDateLabel.classList.add("overdue");
        }

        metaContainer.appendChild(newDueDateLabel);
    }

    saveTasks();
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

function getTaskDueDate(taskItem) {
    const dueDateElement = taskItem.querySelector(".due-date");

    if (!dueDateElement) {
        return "";
    }

    return dueDateElement.textContent.replace("Due: ", "");
}

function saveTasks() {
    const tasks = [];
    const allTasks = document.querySelectorAll(".task-item");

    allTasks.forEach(function (task) {
        tasks.push({
            text: task.querySelector(".task-text").textContent,
            completed: task.classList.contains("completed"),
            priority: getTaskPriority(task),
            dueDate: getTaskDueDate(task)
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
            task.dueDate || ""
        );
    });
}