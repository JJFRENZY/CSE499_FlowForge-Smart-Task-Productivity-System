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

    // COMPLETE BUTTON
    const completeBtn = document.createElement("button");

    completeBtn.textContent = "Complete";

    completeBtn.classList.add("complete-btn");

    completeBtn.addEventListener("click", function () {

        li.classList.toggle("completed");

    });

    // DELETE BUTTON
    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "Delete";

    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", function () {

        li.remove();

    });

    // Button container
    const buttonContainer = document.createElement("div");

    buttonContainer.classList.add("button-container");

    buttonContainer.appendChild(completeBtn);

    buttonContainer.appendChild(deleteBtn);

    // Add elements to task item
    li.appendChild(span);

    li.appendChild(buttonContainer);

    // Add task to page
    taskList.appendChild(li);

    // Clear input
    taskInput.value = "";

});