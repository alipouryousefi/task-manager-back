const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { deleteUser, getUserById, getUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/", protect, adminOnly, getUsers); //get all users
router.get("/:id", protect, getUserById);

module.exports = router;
