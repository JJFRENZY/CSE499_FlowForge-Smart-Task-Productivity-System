const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const taskList = document.getElementById("taskList");

// LOAD TASKS
loadTasks();

// ADD TASK
addTaskBtn.addEventListener("click", function () {

    const taskText = taskInput.value;

    const priority = prioritySelect.value;

    if (taskText === "") {

        alert("Please enter a task.");

        return;

    }

    createTask(taskText, false, priority);

    saveTasks();

    taskInput.value = "";

});

// CREATE TASK
function createTask(taskText, completedStatus, priority) {

    const li = document.createElement("li");

    li.classList.add("task-item");

    if (completedStatus) {

        li.classList.add("completed");

    }

    // LEFT SIDE CONTAINER
    const leftContainer = document.createElement("div");

    leftContainer.classList.add("task-left");

    // TASK TEXT
    const span = document.createElement("span");

    span.textContent = taskText;

    // PRIORITY LABEL
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

    leftContainer.appendChild(span);

    leftContainer.appendChild(priorityLabel);

    // COMPLETE BUTTON
    const completeBtn = document.createElement("button");

    completeBtn.textContent = "Complete";

    completeBtn.classList.add("complete-btn");

    completeBtn.addEventListener("click", function () {

        li.classList.toggle("completed");

        saveTasks();

    });

    // DELETE BUTTON
    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "Delete";

    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", function () {

        li.remove();

        saveTasks();

    });

    // BUTTON CONTAINER
    const buttonContainer = document.createElement("div");

    buttonContainer.classList.add("button-container");

    buttonContainer.appendChild(completeBtn);

    buttonContainer.appendChild(deleteBtn);

    // APPEND
    li.appendChild(leftContainer);

    li.appendChild(buttonContainer);

    taskList.appendChild(li);

}

// SAVE TASKS
function saveTasks() {

    const tasks = [];

    const allTasks = document.querySelectorAll(".task-item");

    allTasks.forEach(function (task) {

        const taskText = task.querySelector(".task-left span").textContent;

        const completed = task.classList.contains("completed");

        let priority = "low";

        const priorityLabel = task.querySelector(".priority-label");

        if (priorityLabel.classList.contains("medium")) {

            priority = "medium";

        }

        if (priorityLabel.classList.contains("high")) {

            priority = "high";

        }

        tasks.push({

            text: taskText,
            completed: completed,
            priority: priority

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

        createTask(task.text, task.completed, task.priority);

    });

}