const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDateInput");
const taskList = document.getElementById("taskList");

// LOAD TASKS
loadTasks();

// ADD TASK
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

// CHECK IF TASK IS OVERDUE
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

// CREATE TASK
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

    if (priority === "low") {

        priorityLabel.textContent = "LOW";

    }

    if (priority === "medium") {

        priorityLabel.textContent = "MED";

    }

    if (priority === "high") {

        priorityLabel.textContent = "HIGH";

    }

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

        if (dueDateLabel) {

            if (li.classList.contains("completed")) {

                dueDateLabel.classList.remove("overdue");

            } else if (isOverdue(dueDate)) {

                dueDateLabel.classList.add("overdue");

            }

        }

        saveTasks();

    });

    const editBtn = document.createElement("button");

    editBtn.textContent = "Edit";

    editBtn.classList.add("edit-btn");

    editBtn.addEventListener("click", function () {

        const currentText = span.textContent;

        const newText = prompt("Edit task:", currentText);

        if (newText === null) {

            return;

        }

        const trimmedText = newText.trim();

        if (trimmedText === "") {

            alert("Task name cannot be empty.");

            return;

        }

        span.textContent = trimmedText;

        saveTasks();

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

// SAVE TASKS
function saveTasks() {

    const tasks = [];

    const allTasks = document.querySelectorAll(".task-item");

    allTasks.forEach(function (task) {

        const taskText = task.querySelector(".task-text").textContent;

        const completed = task.classList.contains("completed");

        let priority = "low";

        const priorityLabel = task.querySelector(".priority-label");

        if (priorityLabel.classList.contains("medium")) {

            priority = "medium";

        }

        if (priorityLabel.classList.contains("high")) {

            priority = "high";

        }

        let dueDate = "";

        const dueDateElement = task.querySelector(".due-date");

        if (dueDateElement) {

            dueDate = dueDateElement.textContent.replace("Due: ", "");

        }

        tasks.push({

            text: taskText,
            completed: completed,
            priority: priority,
            dueDate: dueDate

        });

    });

    localStorage.setItem("tasks", JSON.stringify(tasks));

}

// LOAD TASKS
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
            task.priority,
            task.dueDate
        );

    });

}