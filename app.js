const STORAGE_KEY = "todo_tasks_v1";

let tasks = JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = "all";
let editingId = null;

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const filterGroup = document.getElementById("filter-group");
const clearCompletedBtn = document.getElementById("clear-completed");
const taskCounter = document.getElementById("task-counter");
const emptyState = document.getElementById("empty-state");

function saveTasks() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }
  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }
  return tasks;
}

function updateCounter() {
  const activeCount = tasks.filter((task) => !task.completed).length;
  taskCounter.textContent = `${activeCount} ${activeCount === 1 ? "task" : "tasks"} remaining`;
}

function renderTasks() {
  todoList.innerHTML = "";
  const visibleTasks = getFilteredTasks();

  emptyState.classList.toggle("hidden", visibleTasks.length > 0);
  updateCounter();

  visibleTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `todo-item${task.completed ? " completed" : ""}`;
    li.dataset.id = task.id;

    const leftDiv = document.createElement("div");
    leftDiv.className = "todo-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = task.completed;

    leftDiv.appendChild(checkbox);

    if (editingId === task.id) {
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.className = "edit-input";
      editInput.value = task.text;
      leftDiv.appendChild(editInput);
    } else {
      const span = document.createElement("span");
      span.className = "todo-text";
      span.textContent = task.text;
      leftDiv.appendChild(span);
    }

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "todo-actions";

    if (editingId === task.id) {
      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "action-btn save-btn";
      saveBtn.dataset.action = "save";
      saveBtn.textContent = "Save";
      actionsDiv.appendChild(saveBtn);
    } else {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "action-btn edit-btn";
      editBtn.dataset.action = "edit";
      editBtn.textContent = "Edit";
      actionsDiv.appendChild(editBtn);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "action-btn delete-btn";
    deleteBtn.dataset.action = "delete";
    deleteBtn.textContent = "Delete";
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(leftDiv);
    li.appendChild(actionsDiv);
    todoList.appendChild(li);
  });

  if (editingId) {
    const activeInput = todoList.querySelector(".edit-input");
    if (activeInput) {
      activeInput.focus();
      activeInput.setSelectionRange(activeInput.value.length, activeInput.value.length);
    }
  }
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  tasks.unshift({
    id: Date.now().toString(),
    text: trimmed,
    completed: false
  });

  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function updateTaskText(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) {
    deleteTask(id);
    return;
  }

  tasks = tasks.map((task) =>
    task.id === id ? { ...task, text: trimmed } : task
  );
  editingId = null;
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  if (editingId === id) editingId = null;
  saveTasks();
  renderTasks();
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(todoInput.value);
  todoInput.value = "";
});

todoList.addEventListener("click", (event) => {
  const item = event.target.closest(".todo-item");
  if (!item) return;

  const id = item.dataset.id;

  if (event.target.classList.contains("todo-checkbox")) {
    toggleTask(id);
    return;
  }

  const action = event.target.dataset.action;

  if (action === "edit") {
    editingId = id;
    renderTasks();
  } else if (action === "save") {
    const input = item.querySelector(".edit-input");
    if (input) updateTaskText(id, input.value);
  } else if (action === "delete") {
    deleteTask(id);
  }
});

todoList.addEventListener("keydown", (event) => {
  if (!event.target.classList.contains("edit-input")) return;

  const item = event.target.closest(".todo-item");
  if (!item) return;

  if (event.key === "Enter") {
    updateTaskText(item.dataset.id, event.target.value);
  } else if (event.key === "Escape") {
    editingId = null;
    renderTasks();
  }
});

filterGroup.addEventListener("click", (event) => {
  const btn = event.target.closest(".filter-btn");
  if (!btn) return;

  currentFilter = btn.dataset.filter;
  filterGroup.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.toggle("active", button === btn);
  });
  renderTasks();
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();