const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// Load tasks when page starts
loadTasks();

// Add task button
addTaskBtn.addEventListener("click", function () {

    const taskText = taskInput.value;

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    createTask(taskText, false);

    saveTasks();

    taskInput.value = "";

});

// CREATE TASK FUNCTION
function createTask(taskText, completedStatus) {

    // Create task item
    const li = document.createElement("li");

    li.classList.add("task-item");

    if (completedStatus) {
        li.classList.add("completed");
    }

    // Task text
    const span = document.createElement("span");

    span.textContent = taskText;

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

    // Button container
    const buttonContainer = document.createElement("div");

    buttonContainer.classList.add("button-container");

    buttonContainer.appendChild(completeBtn);

    buttonContainer.appendChild(deleteBtn);

    // Add elements
    li.appendChild(span);

    li.appendChild(buttonContainer);

    taskList.appendChild(li);

}

// SAVE TASKS
function saveTasks() {

    const tasks = [];

    const allTasks = document.querySelectorAll(".task-item");

    allTasks.forEach(function (task) {

        const taskText = task.querySelector("span").textContent;

        const completed = task.classList.contains("completed");

        tasks.push({
            text: taskText,
            completed: completed
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

        createTask(task.text, task.completed);

    });

}