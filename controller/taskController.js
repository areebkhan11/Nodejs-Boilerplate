const {
  startTask,
  getAllTasks,
  deleteTaskById,
  getTaskById,
  updateTaskById,
  getTaskCount,
  getAllInitiatedTasks,
  getAllTasksByUserIdandTodaydate
} = require("../models/taskModel");
const { generateResponse, parseBody } = require("../utils");
const { taskValidation } = require("../validation/taskValidation");
const { STATUS_CODES, STATUS } = require("../utils/constants");
const { getVehicleByVin } = require("../models/vehicleModel");
const { addInitiatedTasksWithCount } = require('../models/taskdetailModel');

exports.startTask = async (req, res, next) => {
  const body = parseBody(req.body);
  body.user = req.user.id;
  const today = new Date();
  const startDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ); // Start of today
  const endDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  // Joi validation
  const { error } = taskValidation.validate(body);
  if (error)
    return next({
      statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
      message: error.details[0].message,
    });

  try {
    // Extract VIN from request body
    const vin = body.vin;
    // Call getVehicle function to retrieve vehicle details by VIN
    const vehicle = await getVehicleByVin(vin);

    // Check if vehicle with the provided VIN exists
    if (!vehicle)
      return next({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: "Vehicle not found",
      });

    // VIN from getVehicle function
    const vehicleVIN = vehicle.vin;

    // Check if VIN from getVehicle function matches VIN from request body
    if (vin !== vehicleVIN)
      return next({
        statusCode: STATUS_CODES.BAD_REQUEST,
        message: "VIN number mismatch",
      });

    const { tasksCount } = await getTaskCount(req.user.id, startDate, endDate);
    const { totalInitialTasks } = await getAllInitiatedTasks(req.user.id, startDate, endDate);

    await addInitiatedTasksWithCount(req.user.id, tasksCount, totalInitialTasks);
    // // If VIN matches, proceed with starting the task
    const task = await startTask(body);
    generateResponse(task, "Task started successfully", res);
  } catch (error) {
    next(error);
  }
};

// get All tasks
exports.getAllTasks = async (req, res, next) => {
  const { search = "" } = req.query;
  const { page = 1, limit = 10 } = req.query;
  const query = {
    $and: [
      {
        $or: [
          {
            status: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      },
      {
        isDeleted: false,
      },
    ],
  };

  try {
    const data = await getAllTasks({
      query,
      page,
      limit,
      populate: [{ path: "locationTo" }, { path: "locationFrom" }],
    });
    if (data?.tasks?.length === 0) {
      generateResponse(null, "No items found", res);
      return;
    }
    generateResponse(data, "Items fetched successfully", res);
  } catch (error) {
    next(error);
  }
};

//update task
exports.updateTaskById = async (req, res, next) => {
  const { taskId } = req.params;
  const body = parseBody(req.body);
  const Images = []
  console.log(req.body, "<==req")
  console.log(req.files, "<==req")
  const { files } = req;
  // if (!files || files.length === 0) {
  //   return next({
  //     statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
  //     message: 'Images are required'
  //   });
  // }
  files.forEach((img) => {
    Images.push(img.path)
  })
  body.images = Images

  try {
    const task = await getTaskById(taskId);
    const startTask = new Date(task.startTask);
    const { endTask } = body;
    const endDate = new Date(endTask);
    const durationMs = endDate - startTask;

    body.durationOfTask = durationMs;
    body.endTask = endDate;
    body.status = STATUS.COMPLETED;
    const updatedTask = await updateTaskById(taskId, body);

    generateResponse(updatedTask, `Task updated successfully`, res);
  } catch (error) {
    next(error);
  }
};

//get task by id
exports.getTaskById = async (req, res, next) => {
  const { taskId } = req.params;
  try {
    console.log("first")
    const task = await getTaskById(taskId);
    generateResponse(task, "Task fetched successfully", res);
  } catch (error) {
    next(error);
  }
};

//delete task
exports.deleteTaskById = async (req, res, next) => {
  const { taskId } = req.params;
  try {
    const task = await deleteTaskById(taskId);
    generateResponse(task, "Task deleted successfully", res);
  } catch (error) {
    next(error);
  }
};

exports.getAllTodaysTasks = async (req, res, next) => {
  const userId = req.user.id;
  const today = new Date();
  const startDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ); // Start of today
  const endDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  ); // End of today

  try {
    const tasks = await getAllTasksByUserIdandTodaydate(userId, startDate, endDate);
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

exports.getAllUserTasks = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const tasks = await getAllTasksByUserIdandTodaydate(userId);
    generateResponse(tasks, 'Tasks Found', res);
  } catch (error) {
    next(error);
  }
};
