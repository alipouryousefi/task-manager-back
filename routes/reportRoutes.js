const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { exportUsersReport, exportTasksReport } = require("../controllers/reportController");

const router = express.Router();

router.get("/export/tasks", protect, adminOnly, exportTasksReport);
router.get("/export/user", protect, adminOnly, exportUsersReport);

module.exports = router;
