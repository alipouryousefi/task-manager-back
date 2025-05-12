const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "member" }).select("-password");

    const userWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const pendingTask = await Task.countDocuments({
          assignTo: user._id,
          status: "Pending",
        });

        const inProgressTask = await Task.countDocuments({
          assignTo: user._id,
          status: "In Progress",
        });

        const completedTask = await Task.countDocuments({
          assignTo: user._id,
          status: "Completed",
        });

        return { ...user._doc, pendingTask, inProgressTask, completedTask };
      })
    );

    res.json(userWithTaskCounts);
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = { getUserById, getUsers };
