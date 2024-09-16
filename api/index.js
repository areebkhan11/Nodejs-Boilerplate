const { Router } = require('express');

const RootAPI = require('./rootApi')
const AuthAPI = require('./authApi');
const UserAPI = require('./userApi');
const VehicleAPI = require('./vehicleApi');
const InspectionAPI = require('./inspectionApi');
// const ServiceAPI = require('./serviceApi');
const MakeAPI = require('./makeApi');
const VehicleCategoryAPI = require('./vehicleCategoryApi');
const ServiceCategoryAPI = require('./serviceCategoryApi');
const ServiceCategoryOptionsAPI = require('./serviceCategoryOptionsApi');
const ServiceTypeAPI = require('./serviceTypeApi');
const ScheduleAPI = require('./scheduleApi');
const SingleServiceAPI = require('./singleServiceCategory')
const ProcessTimeAPI = require('./processTime')
const EmployeeScheduleApi = require('./employeeScheduleApi')
const VehicleTypeAPI = require('./vehicleTypeApi');
const FuelTypeAPI = require('./fuelTypeApi');
const LocationAPI = require('./locationApi');
const ShiftAPI = require('./shiftApi');
const ChatAPI = require('./chatApi');
const TaskAPI = require('./taskApi');
const TaskDetailAPI = require('./taskDetailApi');

class API {
    constructor(app) {
        this.app = app;
        this.router = Router();
        this.routeGroups = [];
    }

    loadRouteGroups() {
        this.routeGroups.push(new RootAPI());
        this.routeGroups.push(new AuthAPI());
        this.routeGroups.push(new ChatAPI());
        this.routeGroups.push(new UserAPI());
        this.routeGroups.push(new VehicleAPI());
        this.routeGroups.push(new VehicleTypeAPI());
        this.routeGroups.push(new InspectionAPI());
        // this.routeGroups.push(new ServiceAPI());
        this.routeGroups.push(new MakeAPI());
        this.routeGroups.push(new VehicleCategoryAPI());
        this.routeGroups.push(new ServiceCategoryAPI());
        this.routeGroups.push(new ServiceCategoryOptionsAPI());
        this.routeGroups.push(new ServiceCategoryOptionsAPI());
        this.routeGroups.push(new ServiceTypeAPI());
        this.routeGroups.push(new ScheduleAPI());
        this.routeGroups.push(new SingleServiceAPI());
        this.routeGroups.push(new ProcessTimeAPI());
        this.routeGroups.push(new EmployeeScheduleApi());
        this.routeGroups.push(new FuelTypeAPI());
        this.routeGroups.push(new LocationAPI());
        this.routeGroups.push(new ShiftAPI());
        this.routeGroups.push(new TaskAPI());
        this.routeGroups.push(new TaskDetailAPI());
    }

    setContentType(req, res, next) {
        res.set('Content-Type', 'application/json');
        next();
    }

    registerGroups() {
        this.loadRouteGroups();
        this.routeGroups.forEach((rg) => {
            console.log('Route group: ' + rg.getRouterGroup());
            this.app.use('/api' + rg.getRouterGroup(), this.setContentType, rg.getRouter());
        });
    }
}

module.exports = API;
