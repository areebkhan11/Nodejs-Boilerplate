const router = require('express').Router();
const {
    addNewSchedule,
    fetchAllSchedules,
    fetchSchedule,
    markedAsCompleted,
    assignToDriver,
    updateInspection,
    taskCounts,
    downloadActivity,
    fetchEmployeeProductivity,
    fetchActivityTrends,
    fetchProductivityBenchmetrix,
    addShiftTime,
    fetchAllEmployees,
    deleteSchedule,
    updateIsStarted
} = require('../controller/scheduleController');
const authMiddleware = require('../middlewares/Auth');
const { upload } = require('../utils');
const { ROLES } = require('../utils/constants');

class ScheduleAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        //get all employees with un assigned scheduleTime

        router.get('/',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD, ROLES.EMPLOYEE]),
            fetchAllSchedules);

        router.get('/get-unassigned-employees',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD, ROLES.EMPLOYEE]),
            fetchAllEmployees);

        router.post('/download-activity-details',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
            downloadActivity);

        router.get('/task-counts',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD, ROLES.EMPLOYEE]),
            taskCounts);

        router.get('/employee-productivity', authMiddleware([ROLES.ADMIN]),
            fetchEmployeeProductivity);

        router.get('/activity-trends', authMiddleware([ROLES.ADMIN]),
            fetchActivityTrends);

        router.get('/productivity-benchmetrix', authMiddleware([ROLES.ADMIN]),
            fetchProductivityBenchmetrix);


        router.get('/:scheduleId',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD, ROLES.EMPLOYEE]),
            fetchSchedule);

        router.post('/',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]),
            addNewSchedule);

        router.put('/update-inspection/:scheduleId/:phaseId',
            authMiddleware([ROLES.EMPLOYEE]),
            upload('Inspections').array('images', 4), updateInspection);


        router.put("/assign/:scheduleId",
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]),
            assignToDriver);


        router.put("/update-scheduleTime/:scheduleId",
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD, ROLES.EMPLOYEE]),
            addShiftTime);

        // mark as completed API
        router.put("/complete/:scheduleId",
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]),
            markedAsCompleted);
        // started schedule API
        router.put("/started/:scheduleId",
            authMiddleware([ROLES.EMPLOYEE]),
            updateIsStarted);

        //delete api
        router.delete("/:scheduleId",
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]),
            deleteSchedule);

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/schedule';
    }
}

module.exports = ScheduleAPI;
