

// All tasks are stored in this array.

const tasks = [
    {
        id: 1,
        title: "Learn JavaScript basics",
        priority: "high",
        status: "todo"
    },
    {
        id: 2,
        title: "Practice DOM manipulation",
        priority: "medium",
        status: "doing"
    },
    {
        id: 3,
        title: "Create TaskFlow layout",
        priority: "low",
        status: "done"
    }
];


// Status order helps us move tasks left and right.

const statuses = ["todo", "doing", "done"];


// Select HTML elements.

const board = document.querySelector("#board");
const taskForm = document.querySelector("#task-form");
const taskTitle = document.querySelector("#task-title");
const taskPriority = document.querySelector("#task-priority");


// Render function: displays tasks from the array.

function render() {

    const columns = document.querySelectorAll(".column");

    columns.forEach(column => {

        const status = column.dataset.status;
        const taskList = column.querySelector(".task-list");
        const count = column.querySelector(".task-count");

        const filteredTasks = tasks.filter(
            task => task.status === status
        );

        // Clear existing cards.

        taskList.innerHTML = "";

        // Create cards for matching tasks.

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

            // Move left button.

            if (currentIndex > 0) {
                const leftButton = document.createElement("button");
                leftButton.type = "button";
                leftButton.textContent = "← Move Left";
                leftButton.dataset.action = "move-left";
                leftButton.dataset.id = task.id;
                actions.appendChild(leftButton);
            }

            // Move right button.

            if (currentIndex < statuses.length - 1) {
                const rightButton = document.createElement("button");
                rightButton.type = "button";
                rightButton.textContent = "Move Right →";
                rightButton.dataset.action = "move-right";
                rightButton.dataset.id = task.id;
                actions.appendChild(rightButton);
            }

            // Delete button.

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";
            deleteButton.dataset.action = "delete";
            deleteButton.dataset.id = task.id;

            actions.appendChild(deleteButton);

            card.appendChild(title);
            card.appendChild(priority);
            card.appendChild(actions);

            taskList.appendChild(card);
        });

        // Update column count.

        count.textContent = filteredTasks.length;
    });
}


// Add a new task.

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = taskTitle.value.trim();
    const priority = taskPriority.value;

    // Reject empty titles.

    if (title === "") {
        alert("Please enter a task title.");
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

    taskForm.reset();

    render();
});


// One click listener handles all task buttons.

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

    // Move task left.

    if (action === "move-left" && currentIndex > 0) {
        task.status = statuses[currentIndex - 1];
    }

    // Move task right.

    else if (
        action === "move-right" &&
        currentIndex < statuses.length - 1
    ) {
        task.status = statuses[currentIndex + 1];
    }

    // Delete task after confirmation.

    else if (action === "delete") {

        const confirmed = confirm(
            "Are you sure you want to delete this task?"
        );

        if (confirmed) {
            const taskIndex = tasks.findIndex(
                task => task.id === taskId
            );

            tasks.splice(taskIndex, 1);
        } else {
            return;
        }
    }

    render();
});


// Header Add Task button focuses the task input.

document.querySelector("#focus-add-task").addEventListener(
    "click",
    function() {
        taskTitle.focus();
    }
);


// Display initial tasks.

render();
