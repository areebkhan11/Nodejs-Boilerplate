exports.ROLES = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  TEAM_LEAD: 'team lead',
  EMPLOYEE: 'employee',
});

exports.ROLES_TYPE = Object.freeze({
  INSPECTOR: 'inspector',
  DRIVER: 'driver',
  CLEANER: 'cleaner',
  TEAM_LEAD: 'team lead',
  MANAGER: 'manager',
  ADMIN: 'admin',
});

exports.PLATFORM = Object.freeze({
  MOBILE: 'mobile',
  BROWSER: 'browser',
});

exports.STATUS_CODES = Object.freeze({
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  AUTHENTICATION_TIMEOUT: 419,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
});

exports.EMAIL_TEMPLATES = Object.freeze({
  RESET_PASSWORD: 'reset-password'
});

exports.SCHEDULE_STATUS = Object.freeze({
  TOTAL: 'Total',
  ASSIGNED: 'Assigned',
  Un_Assigned: 'Un Assigned',
  IN_PROGRESS: 'In Progress',
  DELAYED: 'Delayed',
  COMPLETED: 'Completed',
  NOT_STARTED: 'Not Started',
  DONE: 'Done',
});


exports.SERVICE_DATA_STATUS = Object.freeze({
  PASS: 'Pass',
  FAIL: 'Fail',
  NO_STATUS: 'No Status',
})

exports.STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED:'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  IN_PROGRESS: 'in progress'
})

// exports.VEHICLE_CATEGORY = Object.freeze({
//   SMALL: 'Small',
//   MEDIUM: 'Medium',
//   LARGE: 'Large',
// })