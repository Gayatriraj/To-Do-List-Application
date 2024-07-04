document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
  getTodos(); // Load tasks from local storage on page load
});

function setupEventListeners() {
  const todoInput = document.querySelector(".todo-input");
  const todoButton = document.querySelector(".todo-button");
  const todoList = document.querySelector(".todo-list");
  const filterOption = document.querySelector(".filter-todo");
  const showTasksBtn = document.querySelector(".show-tasks-btn");
  const addTaskBtn = document.querySelector(".add-task-btn");
  const editRemoveBtn = document.querySelector(".edit-remove-btn");
  const formContainer = document.querySelector(".form-container");
  const searchInput = document.querySelector("#search-input");
  const searchButton = document.querySelector("#search-button");
  const searchForm = document.getElementById("search-form");

  // Remove existing event listeners to prevent duplicates
  removeEventListeners();

  // Add Todo button click event
  todoButton.addEventListener("click", addTodo);

  // Todo list click events
  todoList.addEventListener("click", function (event) {
    deleteCheck(event);
    editTodo(event);
  });

  // Filter dropdown change event
  filterOption.addEventListener("change", filterTodo);

  // Show Current Tasks button click event
  showTasksBtn.addEventListener("click", showCurrentTasks);

  // Add Task button click event
  addTaskBtn.addEventListener("click", showAddForm);

  // Edit/Remove Tasks button click event
  editRemoveBtn.addEventListener("click", showEditRemoveForm);

  // Search form submit event
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchTodo();
  });

  // Search button click event
  searchButton.addEventListener("click", function () {
    searchTodo();
  });
}

function removeEventListeners() {
  const todoButton = document.querySelector(".todo-button");
  const todoList = document.querySelector(".todo-list");
  const filterOption = document.querySelector(".filter-todo");
  const showTasksBtn = document.querySelector(".show-tasks-btn");
  const addTaskBtn = document.querySelector(".add-task-btn");
  const editRemoveBtn = document.querySelector(".edit-remove-btn");
  const searchForm = document.getElementById("search-form");

  // Remove Todo button click event
  todoButton.removeEventListener("click", addTodo);

  // Remove Todo list click events
  todoList.removeEventListener("click", deleteCheck);
  todoList.removeEventListener("click", editTodo);

  // Remove Filter dropdown change event
  filterOption.removeEventListener("change", filterTodo);

  // Remove Show Current Tasks button click event
  showTasksBtn.removeEventListener("click", showCurrentTasks);

  // Remove Add Task button click event
  addTaskBtn.removeEventListener("click", showAddForm);

  // Remove Edit/Remove Tasks button click event
  editRemoveBtn.removeEventListener("click", showEditRemoveForm);

  // Remove Search form submit event
  searchForm.removeEventListener("submit", function (event) {
    event.preventDefault();
    searchTodo();
  });
}

function addTodo(event) {
  event.preventDefault();
  const todoInput = document.querySelector(".todo-input");
  const todoList = document.querySelector(".todo-list");

  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo");

  const newTodo = document.createElement("li");
  newTodo.innerText = `${todoList.childElementCount + 1}. ${todoInput.value}`;
  newTodo.classList.add("todo-item");
  todoDiv.appendChild(newTodo);

  const completedButton = document.createElement("button");
  completedButton.innerHTML = '<i class="fas fa-check"></i>';
  completedButton.classList.add("complete-btn", "press-down");
  todoDiv.appendChild(completedButton);

  const editButton = document.createElement("button");
  editButton.innerHTML = '<i class="fas fa-edit"></i>';
  editButton.classList.add("edit-btn");
  todoDiv.appendChild(editButton);

  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
  deleteButton.classList.add("delete-btn");
  todoDiv.appendChild(deleteButton);

  todoList.appendChild(todoDiv);

  saveLocalTodos(todoInput.value);

  todoInput.value = "";
}

function deleteCheck(e) {
  const item = e.target;

  if (item.classList.contains("delete-btn")) {
    if (confirm("Are you sure you want to delete this task?")) {
      const todo = item.parentElement;
      todo.classList.add("deleted");
      removeLocalTodos(todo);
      todo.addEventListener("transitionend", function () {
        todo.remove();
        reassignIDs();
      });
    }
  }

  if (item.classList.contains("complete-btn")) {
    const todo = item.parentElement;
    todo.classList.toggle("completed");
    updateLocalTodos(todo.id, todo.classList.contains("completed"));
  }
}

function editTodo(e) {
  const item = e.target;

  if (item.classList.contains("edit-btn")) {
    const todo = item.parentElement;
    const todoText = todo.querySelector(".todo-item");

    // Check if already in edit mode (input field exists)
    const existingInput = todo.querySelector(".edit-input");
    if (existingInput) {
      return; // Prevent re-entering edit mode
    }

    // Replace the todo text with an input field for inline editing
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.value = todoText.innerText.slice(
      todoText.innerText.indexOf(".") + 2
    );
    textInput.classList.add("edit-input");
    todoText.innerText = ""; // Clear the text node
    todoText.appendChild(textInput);
    textInput.focus();

    // Handle saving the edited text when focus is lost from input
    textInput.addEventListener("blur", function () {
      saveEditedTodoText(todo, textInput);
    });

    // Handle pressing Enter key to save the edited text
    textInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        saveEditedTodoText(todo, textInput);
      }
    });
  }
}

function saveEditedTodoText(todo, textInput) {
  const newText = textInput.value.trim();
  if (newText !== "") {
    const todoItem = todo.querySelector(".todo-item");
    const todoId = todo.id;

    // Update the displayed text in the UI
    todoItem.innerText = `${parseInt(todoId.split("-")[1])}. ${newText}`;

    // Update local storage with the edited text
    updateLocalTodos(todoId, newText);
  } else {
    // If the edited text is empty, restore the original text
    const originalText = todoItem.innerText.slice(
      todoItem.innerText.indexOf(".") + 2
    );
    todoItem.innerText = `${parseInt(todo.id.split("-")[1])}. ${originalText}`;
  }
}

function updateLocalTodos(todoId, newText) {
  let todos = JSON.parse(localStorage.getItem("todos")) || [];

  const todoIndex = parseInt(todoId.split("-")[1]) - 1;
  todos[todoIndex] = newText;

  localStorage.setItem("todos", JSON.stringify(todos));
}

function filterTodo() {
  const filterOption = document.querySelector(".filter-todo");
  const todoList = document.querySelector(".todo-list");
  console.log("Filter option:", filterOption.value);
  const todos = todoList.childNodes;

  todos.forEach(function (todo) {
    console.log("Todo:", todo);
    if (todo.nodeType === 1) {
      switch (filterOption.value) {
        case "all":
          todo.style.display = "flex";
          break;
        case "completed":
          if (todo.classList.contains("completed")) {
            todo.style.display = "flex";
          } else {
            todo.style.display = "none";
          }
          break;
        case "uncompleted":
          if (!todo.classList.contains("completed")) {
            todo.style.display = "flex";
          } else {
            todo.style.display = "none";
          }
          break;
        default:
          todo.style.display = "flex"; // Default to show all if filter value is unexpected
      }
    }
  });

  hideNoTaskFoundMessage();
}

function saveLocalTodos(todo) {
  let todos = JSON.parse(localStorage.getItem("todos")) || [];

  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
}

function getTodos() {
  const todoList = document.querySelector(".todo-list");
  let todos = JSON.parse(localStorage.getItem("todos")) || [];

  todos.forEach(function (todo, index) {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");

    const newTodo = document.createElement("li");
    newTodo.innerText = `${index + 1}. ${todo}`;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);

    const completedButton = document.createElement("button");
    completedButton.innerHTML = '<i class="fas fa-check"></i>';
    completedButton.classList.add("complete-btn", "press-down");
    todoDiv.appendChild(completedButton);

    const editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.classList.add("edit-btn");
    todoDiv.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.classList.add("delete-btn");
    todoDiv.appendChild(deleteButton);

    todoList.appendChild(todoDiv);
  });

  reassignIDs();
  showCurrentTasks();
}

function removeLocalTodos(todo) {
  let todos = JSON.parse(localStorage.getItem("todos")) || [];

  const todoText = todo.querySelector(".todo-item").innerText;
  const todoIndex = todos.indexOf(todoText);
  todos.splice(todoIndex, 1);
  localStorage.setItem("todos", JSON.stringify(todos));
}

function showCurrentTasks() {
  const todoList = document.querySelector(".todo-list");
  const formContainer = document.querySelector(".form-container");
  const noTaskFoundMessage = document.querySelector(".no-task-found");

  const todos = todoList.childNodes;
  todos.forEach(function (todo) {
    if (todo.nodeType === 1) {
      todo.style.display = "flex";
    }
  });

  formContainer.classList.add("hidden");
  todoList.classList.remove("hidden");

  hideNoTaskFoundMessage();
}

function showAddForm() {
  const formContainer = document.querySelector(".form-container");
  const todoList = document.querySelector(".todo-list");
  const noTaskFoundMessage = document.querySelector(".no-task-found");

  formContainer.classList.remove("hidden");
  todoList.classList.add("hidden");

  hideNoTaskFoundMessage();
}

function showEditRemoveForm() {
  const formContainer = document.querySelector(".form-container");
  const todoList = document.querySelector(".todo-list");
  const noTaskFoundMessage = document.querySelector(".no-task-found");

  formContainer.classList.remove("hidden");
  todoList.classList.remove("hidden");

  hideNoTaskFoundMessage();
}

function reassignIDs() {
  const todos = document.querySelectorAll(".todo");

  todos.forEach((todo, index) => {
    const todoId = `todo-${index + 1}`;
    todo.id = todoId;

    const todoText = todo.querySelector(".todo-item");
    const currentText = todoText.innerText;
    const newText = `${index + 1}. ${currentText.substring(currentText.indexOf(". ") + 2)}`;
    todoText.innerText = newText;
  });
}


function searchTodo() {
  const searchInput = document.querySelector("#search-input");
  const todoList = document.querySelector(".todo-list");

  const searchTerm = searchInput.value.trim().toLowerCase();
  const todos = todoList.childNodes;

  let found = false;

  todos.forEach(function (todo) {
    if (todo.nodeType === 1) {
      const todoText = todo.querySelector(".todo-item").innerText.toLowerCase();
      if (todoText.includes(searchTerm)) {
        todo.style.display = "flex";
        found = true;
      } else {
        todo.style.display = "none";
      }
    }
  });

  if (!found) {
    displayNoTaskFoundMessage();
  } else {
    hideNoTaskFoundMessage();
  }
}

function displayNoTaskFoundMessage() {
  let messageElement = document.querySelector(".no-task-found");
  if (!messageElement) {
    messageElement = document.createElement("p");
    messageElement.classList.add("no-task-found");
    messageElement.innerText = "No task found";
    const todoList = document.querySelector(".todo-list");
    todoList.appendChild(messageElement);
  } else {
    messageElement.style.display = "block";
  }
}

function hideNoTaskFoundMessage() {
  const messageElement = document.querySelector(".no-task-found");
  if (messageElement) {
    messageElement.style.display = "none";
  }
}
