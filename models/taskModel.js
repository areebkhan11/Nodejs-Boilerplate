const { getMongoosePaginatedData } = require("../utils");
const TaskModel = require("./schemas/taskSchema");
const { STATUS } = require("../utils/constants")
//start task
exports.startTask = async (obj) => {
  try {
    // Create the task
    const createdTask = await TaskModel.create(obj);

    // Populate the vin field in the created task
    const populatedTask = await TaskModel.populate(createdTask, [
      { path: "locationTo" },
      { path: "locationFrom" },
    ]);
    return populatedTask;
  } catch (error) {
    throw error;
  }
};

//get all tasks
exports.getAllTasks = async ({ query, page, limit, populate }) => {
  try {
    const { data, pagination } = await getMongoosePaginatedData({
      model: TaskModel,
      query,
      page,
      limit,
      populate, // Use the 'populate' parameter passed to the function
    });
    return { tasks: data, pagination };
  } catch (error) {
    throw error;
  }
};

// getTaskById
exports.getTaskById = async (taskId) => {
  try {
    // Find the task by its ID and populate the Vehicle field
    const task = await TaskModel.findById(taskId).populate([
      { path: "locationTo" },
      { path: "locationFrom" },
    ]); // Assuming "vin" is the field referencing the Vehicle collection
    return task;
  } catch (error) {
    throw error;
  }
};

//update task
exports.updateTaskById = async (taskId, obj) => {
  try {
    // Update the task by its ID and retrieve the updated task
    const updatedTask = await TaskModel.findByIdAndUpdate(taskId, obj, {
      new: true,
    });

    // Populate the Vehicle field in the updated task
    const populatedTask = await TaskModel.populate(updatedTask, [
      { path: "locationTo" },
      { path: "locationFrom" },
    ]); // Assuming "vin" is the field referencing the Vehicle collection

    return populatedTask;
  } catch (error) {
    throw error;
  }
};

exports.getAllTasksByUserIdandTodaydate = async (userId) => {
  try {
    const today = new Date();
    // Set the time to the beginning of the day (midnight)
    today.setHours(0, 0, 0, 0);

    // Find tasks based on userId, today's date range, and status "pending"
    const tasks = await TaskModel.find({
      user: userId,
      createdAt: {
        $gte: today,
      },
    }).populate([{ path: "locationTo" }, { path: "locationFrom" },]);

    return tasks;
  } catch (error) {
    throw error;
  }
};

// getAll-INITIATED-Tasks count
exports.getTaskCount = async (userId, startDate, endDate) => {
  try {
    // Find tasks based on userId, today's date range, and status "pending"
    const tasks = await TaskModel.find({
      user: userId,
      startTask: {
        $gte: startDate,
        $lt: endDate
      },
      status: STATUS.COMPLETED,
    });

    // Count the number of tasks found
    const tasksCount = tasks.length;

    return { tasksCount };
  } catch (error) {
    throw error;
  }
};

exports.getAllInitiatedTasks = async (userId, startDate, endDate) => {
  try {
    // Find tasks based on userId, today's date range, and status "pending"
    const tasks = await TaskModel.find({
      user: userId,
      startTask: {
        $gte: startDate,
        $lt: endDate
      },
    });

    // Count the number of tasks found
    const totalInitialTasks = tasks.length;

    return { totalInitialTasks };
  } catch (error) {
    throw error;
  }
};


//delete task
exports.deleteTaskById = (taskId) =>
  TaskModel.findByIdAndUpdate(taskId, { isDeleted: true }, { new: true });
