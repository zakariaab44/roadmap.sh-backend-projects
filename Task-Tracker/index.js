const fs = require("fs");
const currentTime = new Date();
const tasksFileName = "tasks.json";

start();

function start() {
  if (process.argv[2].slice(0, 4) === "mark") {
    markTask(process.argv[2].slice(5));
  }
  switch (process.argv[2]) {
    case "add":
      addTask();
      break;
    case "delete":
      deleteTask();
      break;
    case "list":
      listTasks();
      break;
    case "update":
      updateTask();
  }
}

function addTask() {
  const taskName = process.argv[3];
  if (!taskName) {
    console.log("Please provide a task name.");
    return;
  }
  const option = process.argv[4];
  let task = getNewTask(taskName);
  if (option === "-d") {
    const desciption = process.argv[5];
    task = addTaskDescription(task, desciption);
  }
  const id = getNewId();
  const tasks = loadTasks();
  tasks.push({ id, ...task });
  uploadTasks(tasks);
  console.log(`Task add successfuly (ID:${id})`);
}

function updateTask() {
  const taskName = process.argv[4];
  const taskId = process.argv[3];
  if (!taskId) {
    console.log("Pleas eneter the ID.");
    return;
  }
  const numericTaskId = +taskId;
  if (isNaN(numericTaskId)) {
    console.log("Please enter a valid numeric ID.");
    return;
  }
  if (!taskName) {
    console.log("Please provide a updated task name.");
    return;
  }
  const tasks = loadTasks().map((task) => {
    if (task.id === numericTaskId) {
      const option = process.argv[5];
      if (option === "-d") {
        const desciption = process.argv[6];
        return addTaskDescription(task, desciption);
      }
      return {
        ...task,
        name: taskName,
        updateAt: currentTime,
      };
    }
    return task;
  });
  uploadTasks(tasks);
  console.log(`Task with ID: ${numericTaskId} updated successfully.`);
}

function markTask(status) {
  const taskID = process.argv[3];
  if (!taskID) {
    console.log("Pleas eneter the ID.");
    return;
  }
  const numericTaskId = +taskID;
  if (status === "done" || status === "todo" || status === "in-progress") {
    const tasks = loadTasks().map((task) => {
      if (task.id === numericTaskId) {
        return {
          ...task,
          status: status,
        };
      }
      return task;
    });
    uploadTasks(tasks);
  }
}

function listTasks() {
  const status = process.argv[3];
  if (!status) {
    const tasks = loadTasks();
    tasks.length ? console.log(tasks) : console.log("No tasks available.");
    return;
  }
  if (status === "done" || status === "todo" || status === "in-progress") {
    const tasks = loadTasks().filter((task) => task.status === status);
    tasks.length
      ? console.log(tasks)
      : console.log(`No ${status} tasks available.`);
  } else {
    console.log("Please enter a valid status.");
  }
}

function deleteTask() {
  const taskId = process.argv[3];
  if (!taskId) {
    console.log("Pleas eneter the ID.");
    return;
  }
  const numericTaskId = +taskId;
  if (isNaN(numericTaskId)) {
    console.log("Please enter a valid numeric ID.");
    return;
  }
  const tasks = loadTasks();
  const updatedTasks = tasks.filter((task) => task.id !== numericTaskId);
  if (tasks.length === updatedTasks.length) {
    console.log("Task ID not found.");
    return;
  }
  console.log(`Task with ID: ${numericTaskId} deleted successfully.`);
}

function loadTasks() {
  if (fs.existsSync(tasksFileName)) {
    return JSON.parse(fs.readFileSync(tasksFileName, "utf8"));
  }
  return [];
}

function uploadTasks(tasks) {
  fs.writeFileSync(tasksFileName, JSON.stringify(tasks), "utf8");
}

function getNewId() {
  const tasks = loadTasks();
  return tasks.length ? tasks.at(-1).id + 1 : 0;
}

function getNewTask(name) {
  return {
    name,
    description: "No descition privded",
    status: "todo",
    createdAt: currentTime,
  };
}

function addTaskDescription(task, description) {
  if (!description) {
    console.log("Please provide description.");
    return task;
  }
  return {
    ...task,
    description,
  };
}
