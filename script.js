
// ======================================
// 1. LOAD TASKS FROM LOCAL STORAGE
// ======================================

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem("taskflow-tasks");

        if (savedTasks === null) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        return Array.isArray(parsedTasks) ? parsedTasks : [];

    } catch (error) {
        console.error("Error loading tasks:", error);
        return [];
    }
}


// Our main task array.

let tasks = loadTasks();


// ======================================
// 2. SAVE TASKS TO LOCAL STORAGE
// ======================================

function saveTasks() {
    try {
        localStorage.setItem(
            "taskflow-tasks",
            JSON.stringify(tasks)
        );
    } catch (error) {
        console.error("Error saving tasks:", error);
        showMessage("Unable to save tasks in this browser.");
    }
}


// ======================================
// 3. SELECT HTML ELEMENTS
// ======================================

const board = document.querySelector("#board");

const taskForm = document.querySelector("#task-form");

const taskTitle = document.querySelector("#task-title");

const taskPriority = document.querySelector("#task-priority");

const searchInput = document.querySelector("#search-input");

const importButton = document.querySelector("#import-btn");

const statusMessage = document.querySelector("#status-message");

const statuses = ["todo", "doing", "done"];


// ======================================
// 4. SHOW STATUS MESSAGES
// ======================================

function showMessage(message) {
    statusMessage.textContent = message;
}


// ======================================
// 5. RENDER TASKS
// ======================================

function render() {

    const searchText = searchInput.value.trim().toLowerCase();

    const columns = document.querySelectorAll(".column");

    columns.forEach(column => {

        const status = column.dataset.status;

        const taskList = column.querySelector(".task-list");

        const count = column.querySelector(".task-count");

        // Filter by column status.

        const filteredTasks = tasks.filter(task => {

            return task.status === status &&
                task.title.toLowerCase().includes(searchText);

        });

        taskList.innerHTML = "";

        filteredTasks.forEach(task => {

            const card = document.createElement("div");

            card.className = "task-card";

            const title = document.createElement("h3");

            title.textContent = task.title;

            const priority = document.createElement("span");

            priority.className = `priority priority-${task.priority}`;

            priority.textContent = task.priority;

            const actions = document.createElement("div");

            actions.className = "task-actions";

            const currentIndex = statuses.indexOf(task.status);


            // Move Left Button

            if (currentIndex > 0) {

                const leftButton = document.createElement("button");

                leftButton.type = "button";

                leftButton.textContent = "← Move Left";

                leftButton.dataset.action = "move-left";

                leftButton.dataset.id = task.id;

                actions.appendChild(leftButton);
            }


            // Move Right Button

            if (currentIndex < statuses.length - 1) {

                const rightButton = document.createElement("button");

                rightButton.type = "button";

                rightButton.textContent = "Move Right →";

                rightButton.dataset.action = "move-right";

                rightButton.dataset.id = task.id;

                actions.appendChild(rightButton);
            }


            // Delete Button

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";

            deleteButton.textContent = "Delete";

            deleteButton.className = "delete-btn";

            deleteButton.dataset.action = "delete";

            deleteButton.dataset.id = task.id;

            actions.appendChild(deleteButton);


            // Add everything to the card.

            card.appendChild(title);

            card.appendChild(priority);

            card.appendChild(actions);

            taskList.appendChild(card);

        });

        // Show number of matching visible cards.

        count.textContent = filteredTasks.length;
    });
}


// ======================================
// 6. ADD NEW TASK
// ======================================

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = taskTitle.value.trim();

    const priority = taskPriority.value;

    if (title === "") {

        showMessage("Please enter a task title.");

        taskTitle.focus();

        return;
    }

    const newTask = {

        id: Date.now(),

        title: title,

        priority: priority,

        status: "todo"
    };

    tasks.push(newTask);

    saveTasks();

    taskForm.reset();

    showMessage("Task added successfully!");

    render();
});


// ======================================
// 7. MOVE AND DELETE TASKS
// ======================================

board.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button || !board.contains(button)) {
        return;
    }

    const taskId = Number(button.dataset.id);

    const action = button.dataset.action;

    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    const currentIndex = statuses.indexOf(task.status);


    // Move Left

    if (action === "move-left" && currentIndex > 0) {

        task.status = statuses[currentIndex - 1];

    }


    // Move Right

    else if (
        action === "move-right" &&
        currentIndex < statuses.length - 1
    ) {

        task.status = statuses[currentIndex + 1];

    }


    // Delete Task

    else if (action === "delete") {

        const confirmed = confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        const taskIndex = tasks.findIndex(
            task => task.id === taskId
        );

        tasks.splice(taskIndex, 1);

    }

    saveTasks();

    showMessage("Board updated successfully!");

    render();
});


// ======================================
// 8. LIVE SEARCH
// ======================================

searchInput.addEventListener("input", function() {

    render();

});


// ======================================
// 9. IMPORT SAMPLE TASKS FROM API
// ======================================

importButton.addEventListener("click", async function() {

    importButton.disabled = true;

    importButton.textContent = "Importing...";

    showMessage("Please wait. Importing sample tasks...");

    try {

        const response = await fetch(
            "https://jsonplaceholder.typicode.com/todos?_limit=5"
        );

        if (!response.ok) {
            throw new Error("Unable to fetch sample tasks.");
        }

        const data = await response.json();

        const importedTasks = data.map(item => {

            return {

                id: Date.now() + item.id,

                title: item.title,

                priority: "medium",

                status: item.completed ? "done" : "todo"

            };

        });

        tasks.push(...importedTasks);

        saveTasks();

        render();

        showMessage(
            `${importedTasks.length} sample tasks imported successfully!`
        );

    } catch (error) {

        console.error("Import error:", error);

        showMessage(
            "Sorry, tasks could not be imported. Please check your internet connection and try again."
        );

    } finally {

        importButton.disabled = false;

        importButton.textContent = "Import Sample Tasks";

    }

});


// ======================================
// 10. HEADER ADD TASK BUTTON
// ======================================

document.querySelector("#focus-add-task").addEventListener(
    "click",
    function() {

        taskTitle.focus();

    }
);


// ======================================
// 11. DISPLAY INITIAL TASKS
// ======================================

render();
