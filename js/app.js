
// ---------- DOM Elements ----------
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const taskCount = document.getElementById("task-count");
const emptyMessage = document.getElementById("empty-message");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed");

// ---------- Application State ----------
let tasks = JSON.parse(localStorage.getItem("focuslist-tasks")) || [];
let currentFilter = "all";

// ---------- Save Tasks ----------
function saveTasks() {
    localStorage.setItem("focuslist-tasks", JSON.stringify(tasks));
}

// ---------- Render Tasks ----------
function renderTasks() {
    todoList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(task => {
        const listItem = document.createElement("li");
        listItem.className = "todo-item";
        listItem.dataset.id = task.id;

        if (task.completed) {
            listItem.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "todo-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Mark ${task.text} as completed`);

        const taskText = document.createElement("span");
        taskText.className = "todo-text";
        taskText.textContent = task.text;

        const actions = document.createElement("div");
        actions.className = "todo-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.dataset.action = "edit";
        editButton.textContent = "Edit";
        editButton.setAttribute("aria-label", `Edit ${task.text}`);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.dataset.action = "delete";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

        actions.append(editButton, deleteButton);
        listItem.append(checkbox, taskText, actions);

        todoList.appendChild(listItem);
    });

    // Update remaining task count
    const remainingTasks = tasks.filter(task => !task.completed).length;

    taskCount.textContent =
        `${remainingTasks} ${remainingTasks === 1 ? "task" : "tasks"} remaining`;

    // Show or hide empty message
    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";
}

// ---------- Create Task ----------
todoForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskText = todoInput.value.trim();

    if (taskText === "") {
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    todoInput.value = "";
    todoInput.focus();
});

// ---------- Event Delegation: Checkbox ----------
todoList.addEventListener("change", function(event) {
    if (!event.target.classList.contains("todo-checkbox")) {
        return;
    }

    const listItem = event.target.closest(".todo-item");
    const taskId = listItem.dataset.id;

    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                completed: event.target.checked
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
});

// ---------- Event Delegation: Edit and Delete ----------
todoList.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const listItem = button.closest(".todo-item");
    const taskId = listItem.dataset.id;

    const action = button.dataset.action;

    if (action === "edit") {
        editTask(taskId);
    }

    if (action === "delete") {
        deleteTask(taskId);
    }
});

// ---------- Update Task ----------
function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    const updatedText = prompt("Edit your task:", task.text);

    if (updatedText === null) {
        return;
    }

    if (updatedText.trim() === "") {
        alert("Task cannot be empty!");
        return;
    }

    tasks = tasks.map(item => {
        if (item.id === taskId) {
            return {
                ...item,
                text: updatedText.trim()
            };
        }

        return item;
    });

    saveTasks();
    renderTasks();
}

// ---------- Delete Task ----------
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);

    saveTasks();
    renderTasks();
}

// ---------- Filter Tasks ----------
filterButtons.forEach(button => {
    button.addEventListener("click", function() {
        currentFilter = this.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        renderTasks();
    });
});

// ---------- Clear Completed Tasks ----------
clearCompletedBtn.addEventListener("click", function() {
    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
});

// ---------- Initial Render ----------
renderTasks();
