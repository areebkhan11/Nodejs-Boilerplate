const { getMongooseAggregatePaginatedData, getMongoosePaginatedData } = require("../utils");
const { sign } = require('jsonwebtoken');
const UserModel = require("./schemas/userSchema");

// create new user
exports.createUser = (obj) => UserModel.create(obj);

// find user by query
exports.findUser = (query) => UserModel.findOne(query);

// find all users
exports.findUsersById = (query) => UserModel.find(query);

// update user
exports.updateUser = (query, obj) => UserModel.findOneAndUpdate(query, obj, { new: true });

//get single user
exports.getUser = (query) => UserModel.findOne(query);

// get all users including isBuddy true / false in each user
exports.getAllUsers = async ({ query, page, limit } = {}) => {
  const { data, pagination } = await getMongoosePaginatedData({
    model: UserModel,
    query,
    page,
    limit,
    sort: { firstName: 1 },
  });

  return { users: data, pagination };
};

// generate token
exports.generateToken = (user) => {
  const { JWT_EXPIRATION, JWT_SECRET } = process.env;

  const token = sign({
    id: user._id,
    email: user.email,
    role: user.role,
  }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

  return token;
};

exports.generateResetToken = (user) => {
  const { RESET_TOKEN_EXPIRATION, JWT_SECRET } = process.env;
  const token = sign({
    id: user._id,
    email: user.email,
    role: user.role,
  }, JWT_SECRET, { expiresIn: RESET_TOKEN_EXPIRATION });
  return token;
};

// get FcmToken
exports.getFcmToken = async (userId) => {
  const user = await UserModel.findById(userId).select('fcmToken');
  return user?.fcmToken;
}

// remove user (soft delete)
exports.removeUser = (userId) => UserModel.findByIdAndUpdate(userId, { $set: { isActive: false, isDeleted: true } });

//get AllUsers by Role
exports.getAllUsersByRole = async ({ role, page, limit } = {}) => {
  // Add $match stage to the aggregate pipeline
  const myAggregate = [
    { $match: { role } },
  ];
  // Call getMongooseAggregatePaginatedData with the correct parameters
  const { data, pagination } = await getMongooseAggregatePaginatedData({
    model: UserModel,
    query: myAggregate, // Pass myAggregate as the query parameter
    page,
    limit,
    sort: { firstName: 1 },
  });

  return { users: data, pagination };
}
