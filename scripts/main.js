const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

addTaskBtn.addEventListener("click", function () {

    const taskText = taskInput.value;

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    // Create task item
    const li = document.createElement("li");

    li.classList.add("task-item");

    // Create task text
    const span = document.createElement("span");

    span.textContent = taskText;

    // Create delete button
    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "Delete";

    deleteBtn.classList.add("delete-btn");

    // Delete functionality
    deleteBtn.addEventListener("click", function () {

        li.remove();

    });

    // Add text + button into task item
    li.appendChild(span);

    li.appendChild(deleteBtn);

    // Add task item to page
    taskList.appendChild(li);

    // Clear input
    taskInput.value = "";

});